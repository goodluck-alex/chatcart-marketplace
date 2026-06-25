import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from './entities/order.entity';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class OrdersController {
  constructor(private svc: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  create(@Body() body: { listingId: string; paymentMethod: string; notes?: string }, @CurrentUser() user: User) {
    return this.svc.create(body.listingId, user, body.paymentMethod, body.notes);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get my orders as buyer' })
  getMyOrders(@CurrentUser() user: User, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.svc.getBuyerOrders(user.id, +page, +limit);
  }

  @Get('selling')
  @ApiOperation({ summary: 'Get orders I received as seller' })
  getSellingOrders(@CurrentUser() user: User, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.svc.getSellerOrders(user.id, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findById(id); }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: OrderStatus) {
    return this.svc.updateStatus(id, status);
  }
}
