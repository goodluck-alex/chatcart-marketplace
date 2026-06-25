import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';

export enum OrderStatus { PENDING='pending', CONFIRMED='confirmed', IN_PROGRESS='in_progress', COMPLETED='completed', CANCELLED='cancelled', DISPUTED='disputed', REFUNDED='refunded' }
export enum PaymentStatus { PENDING='pending', COMPLETED='completed', FAILED='failed', REFUNDED='refunded', DISPUTED='disputed' }
export enum PaymentMethod { MTN_MOMO='mtn_momo', AIRTEL_MONEY='airtel_money', STRIPE='stripe', CASH='cash' }

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) orderNumber: string;

  @Column() listingId: string;
  @ManyToOne(() => Listing) @JoinColumn({ name: 'listingId' }) listing: Listing;

  @Column() buyerId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'buyerId' }) buyer: User;

  @Column() sellerId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'sellerId' }) seller: User;

  @Column({ default: 1 }) quantity: number;
  @Column({ type: 'decimal', precision: 15, scale: 2 }) totalAmount: number;
  @Column({ default: 'UGX' }) currency: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING }) status: OrderStatus;
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING }) paymentStatus: PaymentStatus;
  @Column({ nullable: true }) paymentMethod: string;
  @Column({ nullable: true }) paymentReference: string;
  @Column({ type: 'jsonb', nullable: true }) deliveryAddress: Record<string, any>;
  @Column({ nullable: true, type: 'text' }) notes: string;
  @Column({ nullable: true, type: 'text' }) disputeReason: string;
  @Column({ nullable: true, type: 'timestamptz' }) completedAt: Date;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @BeforeInsert()
  generateOrderNumber() {
    this.orderNumber = 'CC-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
  }
}
