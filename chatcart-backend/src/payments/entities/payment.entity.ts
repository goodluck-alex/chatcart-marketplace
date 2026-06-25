import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: true }) orderId: string;
  @Column() userId: string;
  @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
  @Column({ default: 'UGX' }) currency: string;
  @Column() method: string;
  @Column({ default: 'pending' }) status: string;
  @Column({ nullable: true, unique: true }) reference: string;
  @Column({ type: 'jsonb', nullable: true }) providerData: Record<string, any>;
  @Column({ nullable: true }) description: string;
  @Column() type: string; // order | subscription | listing_fee | boost
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
