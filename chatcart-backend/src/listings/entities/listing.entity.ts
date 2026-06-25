import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ListingStatus {
  DRAFT = 'draft', ACTIVE = 'active', SOLD = 'sold',
  RENTED = 'rented', BOOKED = 'booked', SUSPENDED = 'suspended',
  PENDING_REVIEW = 'pending_review', EXPIRED = 'expired',
}

export enum PriceType { FIXED='fixed', NEGOTIABLE='negotiable', PER_NIGHT='per_night', PER_MONTH='per_month', PER_HOUR='per_hour', FREE='free' }
export enum Currency { UGX='UGX', KES='KES', TZS='TZS', USD='USD' }

@Entity('listings')
@Index(['category', 'status'])
@Index(['status', 'isFeatured'])
export class Listing {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() title: string;
  @Column({ unique: true }) slug: string;
  @Column({ type: 'text' }) description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 }) price: number;
  @Column({ type: 'enum', enum: Currency, default: Currency.UGX }) currency: Currency;
  @Column({ type: 'enum', enum: PriceType, default: PriceType.FIXED }) priceType: PriceType;

  @Column() category: string;
  @Column({ nullable: true }) subCategory: string;
  @Column({ nullable: true }) condition: string;

  @Column() sellerId: string;
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column({ nullable: true }) storeId: string;

  @Column({ type: 'jsonb', default: {} }) location: Record<string, any>;
  @Column({ type: 'jsonb', default: {} }) attributes: Record<string, any>;
  @Column({ type: 'simple-array', nullable: true }) tags: string[];

  @Column({ type: 'enum', enum: ListingStatus, default: ListingStatus.PENDING_REVIEW })
  status: ListingStatus;

  @Column({ default: 0 }) views: number;
  @Column({ default: 0 }) wishlistCount: number;
  @Column({ default: 0 }) inquiryCount: number;
  @Column({ default: 0 }) whatsappLeads: number;

  @Column({ default: false }) isFeatured: boolean;
  @Column({ default: false }) isSponsored: boolean;

  @Column({ nullable: true, type: 'timestamptz' }) featuredUntil: Date;
  @Column({ nullable: true, type: 'timestamptz' }) expiresAt: Date;
  @Column({ nullable: true }) thumbnail: string;

  @OneToMany('ListingImage', 'listing', { cascade: true, eager: true })
  images: any[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
