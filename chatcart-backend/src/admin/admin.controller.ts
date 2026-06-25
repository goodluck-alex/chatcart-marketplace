import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

/** All admin endpoints require a valid JWT and admin/superadmin role */
@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
@ApiBearerAuth('JWT')
export class AdminController {
  constructor(private svc: AdminService) {}

  // ── Dashboard ─────────────────────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide statistics' })
  getStats() { return this.svc.getStats(); }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Get revenue chart data (last N days)' })
  getRevenueChart(@Query('days') days = 30) { return this.svc.getRevenueChart(+days); }

  @Get('category-breakdown')
  @ApiOperation({ summary: 'Get listing count breakdown by category' })
  getCategoryBreakdown() { return this.svc.getCategoryBreakdown(); }

  // ── Users ─────────────────────────────────────────────────────────────────
  @Get('users')
  @ApiOperation({ summary: 'List all users with filters' })
  getUsers(
    @Query('query')    query?: string,
    @Query('role')     role?: string,
    @Query('isBanned') isBanned?: boolean,
    @Query('page')     page = 1,
    @Query('limit')    limit = 20,
  ) { return this.svc.getUsers({ query, role, isBanned, page: +page, limit: +limit }); }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update any user field' })
  updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() body: any) { return this.svc.updateUser(id, body); }

  @Post('users/:id/ban')
  @ApiOperation({ summary: 'Ban a user' })
  banUser(@Param('id', ParseUUIDPipe) id: string, @Body('reason') reason: string) { return this.svc.banUser(id, reason); }

  @Post('users/:id/unban')
  @ApiOperation({ summary: 'Unban a user' })
  unbanUser(@Param('id', ParseUUIDPipe) id: string) { return this.svc.unbanUser(id); }

  @Post('users/:id/verify')
  @ApiOperation({ summary: 'Verify a user/seller identity' })
  verifyUser(@Param('id', ParseUUIDPipe) id: string) { return this.svc.verifyUser(id); }

  // ── Listings ──────────────────────────────────────────────────────────────
  @Get('listings')
  @ApiOperation({ summary: 'List all listings with admin filters' })
  getListings(
    @Query('category') category?: string,
    @Query('status')   status?: string,
    @Query('query')    query?: string,
    @Query('page')     page = 1,
    @Query('limit')    limit = 20,
  ) { return this.svc.getListings({ category, status, query, page: +page, limit: +limit }); }

  @Post('listings/:id/approve')
  @ApiOperation({ summary: 'Approve a pending listing' })
  approveListing(@Param('id', ParseUUIDPipe) id: string) { return this.svc.approveListing(id); }

  @Post('listings/:id/reject')
  @ApiOperation({ summary: 'Reject a pending listing with reason' })
  rejectListing(@Param('id', ParseUUIDPipe) id: string, @Body('reason') reason: string) { return this.svc.rejectListing(id, reason); }

  @Post('listings/:id/suspend')
  @ApiOperation({ summary: 'Suspend an active listing' })
  suspendListing(@Param('id', ParseUUIDPipe) id: string, @Body('reason') reason: string) { return this.svc.suspendListing(id, reason); }

  @Post('listings/:id/feature')
  @ApiOperation({ summary: 'Feature a listing for N days' })
  featureListing(@Param('id', ParseUUIDPipe) id: string, @Body('days') days: number) { return this.svc.featureListing(id, +days); }

  @Delete('listings/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a listing' })
  deleteListing(@Param('id', ParseUUIDPipe) id: string) { return this.svc.deleteListing(id); }

  // ── Orders ────────────────────────────────────────────────────────────────
  @Get('orders')
  @ApiOperation({ summary: 'List all orders with filters' })
  getOrders(
    @Query('status') status?: string,
    @Query('page')   page = 1,
    @Query('limit')  limit = 20,
  ) { return this.svc.getOrders({ status, page: +page, limit: +limit }); }

  // ── Stores ────────────────────────────────────────────────────────────────
  @Get('stores')
  @ApiOperation({ summary: 'List all stores' })
  getStores(@Query('page') page = 1, @Query('limit') limit = 20) { return this.svc.getStores(+page, +limit); }

  @Post('stores/:id/verify')
  @ApiOperation({ summary: 'Verify a store/business' })
  verifyStore(@Param('id', ParseUUIDPipe) id: string) { return this.svc.verifyStore(id); }
}
