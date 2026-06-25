import {
  Injectable, UnauthorizedException, BadRequestException, Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, SubscriptionPlan, Country } from '../users/entities/user.entity';
import { LoginSession } from './entities/login-session.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory OTP store (use Redis in production)
  private otpStore = new Map<string, { otp: string; phone: string; attempts: number; expiresAt: number }>();

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(LoginSession) private sessionRepo: Repository<LoginSession>,
    private jwtService: JwtService,
    private cfg: ConfigService,
  ) {}

  // ── Send OTP ──────────────────────────────────────────────────────────────
  async sendOtp(phone: string): Promise<{ sessionId: string }> {
    const normalized = this.normalizePhone(phone);
    const otp = this.generateOtp();
    const sessionId = uuid();
    const expiryMs = parseInt(this.cfg.get('OTP_EXPIRY_MINUTES', '5')) * 60 * 1000;

    this.otpStore.set(sessionId, {
      otp,
      phone: normalized,
      attempts: 0,
      expiresAt: Date.now() + expiryMs,
    });

    // TODO: Send SMS via Africa's Talking (wired in NotificationsService)
    // For now, log in dev mode
    this.logger.log(`[DEV] OTP for ${normalized}: ${otp}`);

    return { sessionId };
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────
  async verifyOtp(sessionId: string, otp: string, ip?: string) {
    const session = this.otpStore.get(sessionId);

    if (!session) throw new UnauthorizedException('OTP session not found or expired');
    if (Date.now() > session.expiresAt) {
      this.otpStore.delete(sessionId);
      throw new UnauthorizedException('OTP has expired. Please request a new one.');
    }

    const maxAttempts = parseInt(this.cfg.get('OTP_MAX_ATTEMPTS', '5'));
    if (session.attempts >= maxAttempts) {
      this.otpStore.delete(sessionId);
      throw new UnauthorizedException('Too many failed attempts. Request a new OTP.');
    }

    if (session.otp !== otp) {
      this.otpStore.set(sessionId, { ...session, attempts: session.attempts + 1 });
      throw new UnauthorizedException(`Invalid OTP. ${maxAttempts - session.attempts - 1} attempts remaining.`);
    }

    this.otpStore.delete(sessionId); // Single-use

    let user = await this.userRepo.findOne({ where: { phone: session.phone } });
    const isNewUser = !user;

    if (!user) {
      user = this.userRepo.create({
        phone: session.phone,
        role: UserRole.BUYER,
        subscriptionPlan: SubscriptionPlan.FREE,
        country: Country.UG,
        isActive: true,
      });
      await this.userRepo.save(user);
    }

    const tokens = await this.issueTokens(user, ip);
    return { tokens, user, isNewUser };
  }

  // ── Refresh Tokens ────────────────────────────────────────────────────────
  async refresh(refreshToken: string) {
    const session = await this.sessionRepo.findOne({ where: { refreshToken, isRevoked: false } });
    if (!session || new Date() > session.expiresAt) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    const user = await this.userRepo.findOne({ where: { id: session.userId } });
    if (!user) throw new UnauthorizedException('User not found');

    // Rotate — invalidate old, issue new
    await this.sessionRepo.update(session.id, { isRevoked: true });
    return this.issueTokens(user);
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  async logout(refreshToken: string) {
    await this.sessionRepo.update({ refreshToken }, { isRevoked: true });
  }

  // ── Get current user ──────────────────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  async issueTokens(user: User, ip?: string) {
    const payload = { sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.cfg.get('JWT_SECRET'),
      expiresIn: this.cfg.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.cfg.get('JWT_REFRESH_SECRET'),
      expiresIn: this.cfg.get('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.sessionRepo.save(
      this.sessionRepo.create({ userId: user.id, refreshToken, ipAddress: ip, expiresAt }),
    );

    return { accessToken, refreshToken, expiresIn: 900 };
  }

  private normalizePhone(phone: string) {
    const clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) return '+256' + clean.slice(1);
    if (clean.startsWith('256')) return '+' + clean;
    if (clean.startsWith('254')) return '+' + clean;
    if (clean.startsWith('255')) return '+' + clean;
    return '+' + clean;
  }

  private generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
