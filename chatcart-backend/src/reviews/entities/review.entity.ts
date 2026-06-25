import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: true }) listingId: string;
  @Column() sellerId: string;
  @Column() reviewerId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'reviewerId' }) reviewer: User;
  @Column({ nullable: true }) orderId: string;
  @Column({ type: 'smallint' }) rating: number;
  @Column({ nullable: true, type: 'text' }) comment: string;
  @Column({ default: false }) isVerifiedPurchase: boolean;
  @Column({ nullable: true, type: 'text' }) reply: string;
  @Column({ nullable: true, type: 'timestamptz' }) repliedAt: Date;
  @Column({ default: false }) isHidden: boolean;
  @CreateDateColumn() createdAt: Date;
}
