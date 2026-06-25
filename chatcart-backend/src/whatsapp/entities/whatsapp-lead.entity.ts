import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('whatsapp_leads')
export class WhatsappLead {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() listingId: string;
  @Column() sellerId: string;
  @Column() buyerPhone: string;
  @Column({ nullable: true }) buyerName: string;
  @Column({ nullable: true, type: 'text' }) message: string;
  @Column({ default: 'new' }) status: string; // new | contacted | converted | lost
  @Column({ nullable: true, type: 'timestamptz' }) convertedAt: Date;
  @Column({ nullable: true }) orderId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
