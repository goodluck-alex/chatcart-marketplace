import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column() name: string;
  @Column({ unique: true }) slug: string;
  @Column({ nullable: true, type: 'text' }) description: string;
  @Column({ nullable: true }) logo: string;
  @Column({ nullable: true }) coverImage: string;
  @Column() whatsappNumber: string;
  @Column({ nullable: true }) website: string;
  @Column({ nullable: true }) address: string;
  @Column({ nullable: true }) city: string;
  @Column({ default: 'UG' }) country: string;

  /** Comma-separated list of active categories for this store */
  @Column({ type: 'simple-array', nullable: true }) categories: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 }) rating: number;
  @Column({ default: 0 }) reviewCount: number;
  @Column({ default: 0 }) totalListings: number;
  @Column({ default: 0 }) totalSales: number;
  @Column({ default: false }) isVerified: boolean;
  @Column({ default: false }) isFeatured: boolean;
  @Column({ default: 'free' }) plan: string;
  @Column({ nullable: true, type: 'timestamptz' }) planExpiresAt: Date;
  @Column({ default: 0 }) followersCount: number;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
