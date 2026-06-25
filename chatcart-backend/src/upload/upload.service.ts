import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private r2: S3Client;

  constructor(private cfg: ConfigService) {
    this.r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${cfg.get('CF_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId:     cfg.get('R2_ACCESS_KEY_ID')     ?? '',
        secretAccessKey: cfg.get('R2_SECRET_ACCESS_KEY') ?? '',
      },
    });
  }

  /** Upload a single image buffer to Cloudflare R2 and return public URL */
  async uploadImage(
    fileBuffer: Buffer,
    originalName: string,
    folder = 'listings',
    mimeType = 'image/jpeg',
  ): Promise<{ url: string; thumbnailUrl: string; key: string }> {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(mimeType)) {
      throw new BadRequestException(`Unsupported file type: ${mimeType}. Allowed: jpg, png, webp`);
    }

    const ext    = path.extname(originalName) || '.jpg';
    const key    = `${folder}/${uuid()}${ext}`;
    const bucket = this.cfg.get('R2_BUCKET_NAME') ?? 'chatcart-media';
    const cdnUrl = this.cfg.get('R2_PUBLIC_URL')  ?? 'https://cdn.chatcart.africa';

    try {
      // Upload full-size image
      await this.r2.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
        Metadata: { originalName },
      }));

      const url = `${cdnUrl}/${key}`;

      // For thumbnails: in production use Sharp to resize to 400×300
      // For now return same URL (add Sharp resize once backend is deployed)
      const thumbnailUrl = url;

      this.logger.log(`Uploaded: ${key}`);
      return { url, thumbnailUrl, key };
    } catch (err) {
      this.logger.error('R2 upload failed', err?.message);
      throw new BadRequestException('Image upload failed. Check R2 credentials.');
    }
  }

  /** Delete an object from R2 by its key */
  async deleteImage(key: string): Promise<void> {
    const bucket = this.cfg.get('R2_BUCKET_NAME') ?? 'chatcart-media';
    try {
      await this.r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      this.logger.log(`Deleted: ${key}`);
    } catch (err) {
      this.logger.warn(`Failed to delete ${key}: ${err?.message}`);
    }
  }
}
