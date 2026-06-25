import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() type: string; // message | order | listing | system | promo | review
  @Column() title: string;
  @Column({ type: 'text' }) body: string;
  @Column({ type: 'jsonb', nullable: true }) data: Record<string, any>;
  @Column({ default: false }) isRead: boolean;
  @Column({ nullable: true, type: 'timestamptz' }) readAt: Date;
  @Column({ nullable: true }) icon: string;
  @CreateDateColumn() createdAt: Date;
}
