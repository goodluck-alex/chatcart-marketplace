import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole { BUYER = 'buyer', SELLER = 'seller', BUSINESS = 'business', ADMIN = 'admin', SUPERADMIN = 'superadmin' }
export enum SubscriptionPlan { FREE = 'free', INDIVIDUAL = 'individual', STARTER = 'starter', PRO = 'pro', ENTERPRISE = 'enterprise' }
export enum VerificationStatus { UNVERIFIED = 'unverified', PENDING = 'pending', VERIFIED = 'verified', REJECTED = 'rejected' }
export enum Country { UG = 'UG', KE = 'KE', TZ = 'TZ' }

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.BUYER })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.UNVERIFIED })
  verificationStatus: VerificationStatus;

  @Column({ type: 'enum', enum: SubscriptionPlan, default: SubscriptionPlan.FREE })
  subscriptionPlan: SubscriptionPlan;

  @Column({ nullable: true, type: 'timestamptz' })
  subscriptionExpiresAt: Date;

  @Column({ type: 'enum', enum: Country, default: Country.UG })
  country: Country;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ default: 0 })
  totalListings: number;

  @Column({ default: 0 })
  totalSales: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true })
  bannedReason: string;

  @Column({ type: 'simple-array', nullable: true })
  deviceTokens: string[];

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  lastSeenAt: Date;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
