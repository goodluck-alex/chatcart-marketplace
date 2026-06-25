import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappLead } from './entities/whatsapp-lead.entity';
import { Listing } from '../listings/entities/listing.entity';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    @InjectRepository(WhatsappLead) private leadRepo: Repository<WhatsappLead>,
    @InjectRepository(Listing) private listingRepo: Repository<Listing>,
    private cfg: ConfigService,
  ) {}

  async recordLead(listingId: string, buyerPhone: string, message?: string) {
    const listing = await this.listingRepo.findOne({ where: { id: listingId } });
    if (!listing) return;

    const lead = await this.leadRepo.save(this.leadRepo.create({
      listingId, sellerId: listing.sellerId, buyerPhone, message,
    }));

    await this.listingRepo.increment({ id: listingId }, 'whatsappLeads', 1);
    return lead;
  }

  async getLeadsForSeller(sellerId: string, page = 1, limit = 20) {
    const [items, total] = await this.leadRepo.findAndCount({
      where: { sellerId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }

  async updateLeadStatus(id: string, status: string) {
    const update: any = { status };
    if (status === 'converted') update.convertedAt = new Date();
    await this.leadRepo.update(id, update);
    return this.leadRepo.findOne({ where: { id } });
  }

  // Verify WhatsApp webhook
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = this.cfg.get('WA_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === verifyToken) return challenge;
    return null;
  }

  // Process incoming WhatsApp messages
  async processWebhookEvent(body: any) {
    const messages = body?.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!messages?.length) return;
    for (const msg of messages) {
      this.logger.log(`Incoming WA message from ${msg.from}: ${msg.text?.body ?? '[media]'}`);
      // TODO: match to lead, auto-reply, sync to chat dashboard
    }
  }

  // Send WA message via Business API
  async sendMessage(to: string, templateName: string, params: string[]) {
    const phoneNumberId = this.cfg.get('WA_PHONE_NUMBER_ID');
    const accessToken   = this.cfg.get('WA_ACCESS_TOKEN');
    if (!phoneNumberId || !accessToken) { this.logger.warn('WhatsApp API not configured'); return; }

    try {
      await axios.post(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: [{ type: 'body', parameters: params.map(p => ({ type: 'text', text: p })) }],
          },
        },
        { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } },
      );
    } catch (err) {
      this.logger.error('WhatsApp send failed', err?.response?.data);
    }
  }
}
