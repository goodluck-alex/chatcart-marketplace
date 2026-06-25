import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('stores')
@Controller('stores')
export class StoresController {
  constructor(private svc: StoresService) {}

  @Get()
  @ApiOperation({ summary: 'List all stores (paginated)' })
  getAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.svc.getAll(+page, +limit);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get my store profile' })
  getMine(@CurrentUser() user: User) {
    return this.svc.findByUser(user.id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get store by slug (public)' })
  getBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get store by ID (public)' })
  getById(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get store analytics' })
  getAnalytics(@Param('id') id: string) {
    return this.svc.getAnalytics(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a store/business profile' })
  create(@CurrentUser() user: User, @Body() body: any) {
    return this.svc.create(user.id, body);
  }

  @Patch('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update my store profile' })
  update(@CurrentUser() user: User, @Body() body: any) {
    return this.svc.update(user.id, body);
  }
}
