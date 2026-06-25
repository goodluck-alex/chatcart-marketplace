import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Order)   private orderRepo: Repository<Order>,
    @InjectRepository(User)    private userRepo: Repository<User>,
    private cfg: ConfigService,
  ) {}

  // ── MTN Mobile Money ──────────────────────────────────────────────────────
  async initiateMtnMomo(orderId: string, phone: string, amount: number, currency = 'UGX') {
    const referenceId = uuid();
    const baseUrl = this.cfg.get('MTN_MOMO_BASE_URL');
    const primaryKey = this.cfg.get('MTN_MOMO_COLLECTION_PRIMARY_KEY');
    const userId = this.cfg.get('MTN_MOMO_COLLECTION_USER_ID');
    const apiKey = this.cfg.get('MTN_MOMO_COLLECTION_API_KEY');
    const env = this.cfg.get('MTN_MOMO_ENVIRONMENT', 'sandbox');

    try {
      // 1. Get token
      const tokenRes = await axios.post(`${baseUrl}/collection/token/`, {}, {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${userId}:${apiKey}`).toString('base64'),
          'Ocp-Apim-Subscription-Key': primaryKey,
          'X-Target-Environment': env,
        },
      });

      // 2. Request to pay
      await axios.post(`${baseUrl}/collection/v1_0/requesttopay`, {
        amount: amount.toString(),
        currency,
        externalId: orderId,
        payer: { partyIdType: 'MSISDN', partyId: phone.replace('+', '') },
        payerMessage: 'ChatCart Payment',
        payeeNote: `Order ${orderId}`,
      }, {
        headers: {
          Authorization: `Bearer ${tokenRes.data.access_token}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': env,
          'Ocp-Apim-Subscription-Key': primaryKey,
          'Content-Type': 'application/json',
        },
      });

      // Save payment record
      await this.paymentRepo.save(this.paymentRepo.create({
        orderId, userId: '', amount, currency,
        method: 'mtn_momo', status: 'pending',
        reference: referenceId, type: 'order',
        description: `MTN MoMo payment for order ${orderId}`,
      }));

      return { referenceId, status: 'pending' };
    } catch (err) {
      this.logger.error('MTN MoMo initiation failed', err?.response?.data);
      throw err;
    }
  }

  // ── MTN Callback ──────────────────────────────────────────────────────────
  async handleMtnCallback(body: any) {
    const { referenceId, status, externalId } = body;
    const mtnStatus = status?.toLowerCase();
    const paymentStatus = mtnStatus === 'successful' ? 'completed' : 'failed';

    await this.paymentRepo.update({ reference: referenceId }, { status: paymentStatus, providerData: body });
    if (paymentStatus === 'completed' && externalId) {
      await this.orderRepo.update({ id: externalId }, { paymentStatus: 'completed' as any, status: 'confirmed' as any });
    }
    this.logger.log(`MTN callback: ${referenceId} → ${paymentStatus}`);
  }

  // ── Airtel Money ──────────────────────────────────────────────────────────
  async initiateAirtelMoney(orderId: string, phone: string, amount: number, country = 'UG', currency = 'UGX') {
    const transactionId = uuid();
    const clientId = this.cfg.get('AIRTEL_CLIENT_ID');
    const clientSecret = this.cfg.get('AIRTEL_CLIENT_SECRET');
    const baseUrl = this.cfg.get('AIRTEL_BASE_URL', 'https://openapi.airtel.africa');

    try {
      // Get token
      const tokenRes = await axios.post(`${baseUrl}/auth/oauth2/token`, {
        client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials',
      });

      // Initiate payment
      await axios.post(`${baseUrl}/merchant/v1/payments/`, {
        reference: orderId,
        subscriber: { country, currency, msisdn: phone.replace('+', '').replace(/^0/, '256') },
        transaction: { amount, country, currency, id: transactionId },
      }, {
        headers: {
          Authorization: `Bearer ${tokenRes.data.access_token}`,
          'X-Country': country, 'X-Currency': currency, 'Content-Type': 'application/json',
        },
      });

      await this.paymentRepo.save(this.paymentRepo.create({
        orderId, userId: '', amount, currency,
        method: 'airtel_money', status: 'pending',
        reference: transactionId, type: 'order',
      }));

      return { referenceId: transactionId, status: 'pending' };
    } catch (err) {
      this.logger.error('Airtel Money initiation failed', err?.response?.data);
      throw err;
    }
  }

  // ── Airtel Callback ───────────────────────────────────────────────────────
  async handleAirtelCallback(body: any) {
    const { transaction } = body;
    if (!transaction) return;
    const status = transaction.status_code === 'TS' ? 'completed' : 'failed';
    await this.paymentRepo.update({ reference: transaction.id }, { status, providerData: body });
    this.logger.log(`Airtel callback: ${transaction.id} → ${status}`);
  }

  // ── Stripe ────────────────────────────────────────────────────────────────
  async createStripePaymentIntent(orderId: string, amount: number, currency = 'usd') {
    // Dynamic import to avoid crash if stripe not installed
    const Stripe = require('stripe');
    const stripe = new Stripe(this.cfg.get('STRIPE_SECRET_KEY'));

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency,
      metadata: { orderId },
    });

    await this.paymentRepo.save(this.paymentRepo.create({
      orderId, userId: '', amount, currency: currency.toUpperCase(),
      method: 'stripe', status: 'pending',
      reference: intent.id, type: 'order',
    }));

    return { clientSecret: intent.client_secret, referenceId: intent.id };
  }

  // ── Stripe Webhook ────────────────────────────────────────────────────────
  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    const Stripe = require('stripe');
    const stripe = new Stripe(this.cfg.get('STRIPE_SECRET_KEY'));
    const event  = stripe.webhooks.constructEvent(rawBody, signature, this.cfg.get('STRIPE_WEBHOOK_SECRET'));

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      await this.paymentRepo.update({ reference: intent.id }, { status: 'completed', providerData: intent });
      if (intent.metadata?.orderId) {
        await this.orderRepo.update({ id: intent.metadata.orderId }, { paymentStatus: 'completed' as any, status: 'confirmed' as any });
      }
    }
    this.logger.log(`Stripe webhook: ${event.type}`);
  }

  async getPaymentHistory(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.paymentRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }
}
