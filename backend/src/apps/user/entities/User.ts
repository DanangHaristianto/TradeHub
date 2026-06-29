import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['createdAt'])
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  avatar?: string;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ type: 'varchar', default: 'USER' })
  role: 'USER' | 'ADMIN' | 'MODERATOR';

  @Column({ type: 'boolean', default: true })
  twoFactorEnabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  twoFactorSecret?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalProfit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  profitPercentage: number;

  @Column({ type: 'varchar', default: 'UTC' })
  timezone: string;

  @Column({ type: 'varchar', default: 'en' })
  language: string;

  @Column({ type: 'simple-json', nullable: true })
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsAlerts: boolean;
    orderConfirmation: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
