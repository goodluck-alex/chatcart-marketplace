import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('login_sessions')
export class LoginSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ unique: true })
  refreshToken: string;

  @Column({ nullable: true }) deviceName: string;
  @Column({ nullable: true }) platform: string;
  @Column({ nullable: true }) ipAddress: string;
  @Column({ nullable: true }) city: string;
  @Column({ nullable: true }) country: string;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  lastActiveAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
