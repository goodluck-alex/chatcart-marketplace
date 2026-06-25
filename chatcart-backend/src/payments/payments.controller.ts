import { Controller, Post, Get, Body, Headers, RawBodyRequest, Req, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private svc: PaymentsService) {}

  // Initiate MTN MoMo
  @Post('mtn/initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Initiate MTN Mobile Money payment' })
  initMtn(@Body() body: { orderId: string; phone: string; amount: number; currency?: string }) {
    return this.svc.initiateMtnMomo(body.orderId, body.phone, body.amount, body.currency);
  }

  // MTN webhook — no auth (called by MTN servers)
  @Post('mtn/callback')
  @ApiOperation({ summary: 'MTN MoMo payment callback webhook' })
  mtnCallback(@Body() body: any) { return this.svc.handleMtnCallback(body); }

  // Initiate Airtel
  @Post('airtel/initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Initiate Airtel Money payment' })
  initAirtel(@Body() body: { orderId: string; phone: string; amount: number; country?: string; currency?: string }) {
    return this.svc.initiateAirtelMoney(body.orderId, body.phone, body.amount, body.country, body.currency);
  }

  // Airtel webhook
  @Post('airtel/callback')
  @ApiOperation({ summary: 'Airtel Money payment callback webhook' })
  airtelCallback(@Body() body: any) { return this.svc.handleAirtelCallback(body); }

  // Stripe PaymentIntent
  @Post('stripe/intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create Stripe PaymentIntent for card payment' })
  stripeIntent(@Body() body: { orderId: string; amount: number; currency?: string }) {
    return this.svc.createStripePaymentIntent(body.orderId, body.amount, body.currency);
  }

  // Stripe webhook (raw body required)
  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Stripe payment webhook' })
  stripeWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    return this.svc.handleStripeWebhook(req.rawBody as Buffer, sig);
  }

  // Payment history
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get payment history for current user' })
  history(@CurrentUser() user: User, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.svc.getPaymentHistory(user.id, +page, +limit);
  }
}
