import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification) private repo: Repository<Notification>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private cfg: ConfigService,
  ) {}

  // ── Create & send push notification ───────────────────────────────────────
  async send(data: { userId: string; type: string; title: string; body: string; icon?: string; notifData?: Record<string, any> }) {
    const notif = await this.repo.save(this.repo.create({
      userId: data.userId, type: data.type, title: data.title, body: data.body,
      icon: data.icon, data: data.notifData,
    }));

    // FCM push (if device tokens available)
    const user = await this.userRepo.findOne({ where: { id: data.userId } });
    if (user?.deviceTokens?.length) {
      await this.pushFcm(user.deviceTokens, data.title, data.body, data.notifData);
    }

    return notif;
  }

  // ── FCM Push via REST API ─────────────────────────────────────────────────
  async pushFcm(tokens: string[], title: string, body: string, data?: Record<string, any>) {
    const projectId = this.cfg.get('FIREBASE_PROJECT_ID');
    if (!projectId) return;

    try {
      for (const token of tokens) {
        await axios.post(
          `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
          { message: { token, notification: { title, body }, data: data ?? {} } },
          { headers: { 'Content-Type': 'application/json' } },
        );
      }
    } catch (err) {
      this.logger.error('FCM push failed', err?.response?.data ?? err?.message);
    }
  }

  // ── SMS via Africa's Talking ──────────────────────────────────────────────
  async sendSms(phone: string, message: string) {
    const username = this.cfg.get('AT_USERNAME');
    const apiKey   = this.cfg.get('AT_API_KEY');
    const env      = this.cfg.get('AT_ENVIRONMENT', 'sandbox');
    if (!username || !apiKey) { this.logger.warn('[SMS] Africa\'s Talking not configured'); return; }

    const baseUrl = env === 'sandbox'
      ? 'https://api.sandbox.africastalking.com/version1/messaging'
      : 'https://api.africastalking.com/version1/messaging';

    try {
      const params = new URLSearchParams({ username, to: phone, message });
      const senderId = this.cfg.get('AT_SENDER_ID');
      if (senderId) params.append('from', senderId);

      await axios.post(baseUrl, params, {
        headers: { apiKey, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      this.logger.log(`SMS sent to ${phone}`);
    } catch (err) {
      this.logger.error('SMS send failed', err?.response?.data ?? err?.message);
    }
  }

  // ── Get user notifications ────────────────────────────────────────────────
  async getForUser(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }

  async markRead(id: string)  { await this.repo.update(id, { isRead: true, readAt: new Date() }); }
  async markAllRead(userId: string) { await this.repo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() }); }
}
