import {
  Controller, Post, Delete, Param, Query,
  UploadedFile, UseInterceptors, UseGuards,
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UploadController {
  constructor(private svc: UploadService) {}

  /**
   * POST /v1/upload/image?folder=listings
   * Accepts: multipart/form-data, field name "file"
   * Returns: { url, thumbnailUrl, key }
   */
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single image to Cloudflare R2' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10 MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('folder') folder = 'listings',
  ) {
    return this.svc.uploadImage(file.buffer, file.originalname, folder, file.mimetype);
  }

  /** DELETE /v1/upload/image/:key — delete from R2 */
  @Delete('image/:key(*)')
  @ApiOperation({ summary: 'Delete an image from Cloudflare R2 by its object key' })
  deleteImage(@Param('key') key: string) {
    return this.svc.deleteImage(key);
  }
}
