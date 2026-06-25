import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(private svc: ListingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all listings with filters and pagination' })
  findAll(
    @Query('category') category?: string,
    @Query('query') query?: string,
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sellerVerified') sellerVerified?: boolean,
    @Query('isFeatured') isFeatured?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAll({ category, query, city, minPrice, maxPrice, sellerVerified, isFeatured, sortBy, page, limit });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured listings' })
  getFeatured(@Query('limit') limit?: number) {
    return this.svc.getFeatured(limit);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current seller\'s listings' })
  getMyListings(@CurrentUser() user: User, @Query() query: any) {
    return this.svc.getMyListings(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single listing by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new listing' })
  create(@Body() body: any, @CurrentUser() user: User) {
    return this.svc.create(body, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update a listing' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: any, @CurrentUser() user: User) {
    return this.svc.update(id, body, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a listing' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.svc.remove(id, user.id);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Track a listing view' })
  incrementView(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.incrementView(id);
  }

  @Post(':id/whatsapp-click')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Track WhatsApp lead click' })
  trackWhatsApp(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.trackWhatsAppClick(id);
  }
}
