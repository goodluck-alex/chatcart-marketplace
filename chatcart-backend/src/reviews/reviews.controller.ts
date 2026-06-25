import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private svc: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Submit a review for a seller' })
  create(@Body() body: any, @CurrentUser() user: User) {
    return this.svc.create({ ...body, reviewerId: user.id });
  }

  @Get('seller/:id')
  @ApiOperation({ summary: 'Get reviews for a seller' })
  forSeller(@Param('id') id: string, @Query('page') page = 1) { return this.svc.forSeller(id, +page); }

  @Get('listing/:id')
  @ApiOperation({ summary: 'Get reviews for a listing' })
  forListing(@Param('id') id: string, @Query('page') page = 1) { return this.svc.forListing(id, +page); }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Reply to a review' })
  reply(@Param('id') id: string, @Body('reply') reply: string) { return this.svc.reply(id, reply); }
}
