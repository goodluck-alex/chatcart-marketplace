import {
  Controller, Post, Get, Patch, Body, Param, Query,
  Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private svc: WhatsappService) {}

  /** Webhook verification — called once by Meta when you register the webhook */
  @Get('webhook')
  @ApiOperation({ summary: 'Verify WhatsApp webhook (Meta handshake)' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const result = this.svc.verifyWebhook(mode, token, challenge);
    if (result) return res.status(200).send(result);
    res.status(403).send('Forbidden');
  }

  /** Receive incoming WhatsApp messages / status updates */
  @Post('webhook')
  @ApiOperation({ summary: 'Receive WhatsApp messages and events' })
  receiveEvent(@Body() body: any, @Res() res: Response) {
    this.svc.processWebhookEvent(body); // fire-and-forget
    res.status(200).send('OK');
  }

  /** Track a WhatsApp click from listing detail page */
  @Post('leads/:listingId')
  @ApiOperation({ summary: 'Record WhatsApp lead click for a listing' })
  recordLead(
    @Param('listingId') listingId: string,
    @Body() body: { buyerPhone: string; message?: string },
  ) {
    return this.svc.recordLead(listingId, body.buyerPhone, body.message);
  }

  /** Get all WhatsApp leads for the signed-in seller */
  @Get('leads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get WhatsApp leads for current seller' })
  getLeads(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.svc.getLeadsForSeller(user.id, +page, +limit);
  }

  /** Update lead status (new → contacted → converted | lost) */
  @Patch('leads/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update WhatsApp lead status' })
  updateLeadStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.svc.updateLeadStatus(id, status);
  }
}
