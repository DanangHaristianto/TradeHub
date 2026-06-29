import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('alerts')
@Index(['userId'])
@Index(['symbol'])
@Index(['status'])
@Index(['createdAt'])
export class Alert {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  symbol: string;

  @Column({ type: 'varchar' })
  alertType: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PERCENTAGE_CHANGE' | 'VOLUME_SPIKE' | 'MOVING_AVERAGE' | 'RSI' | 'MACD';

  @Column({ type: 'decimal', precision: 15, scale: 8, nullable: true })
  triggerPrice?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentageChange?: number;

  @Column({ type: 'simple-json', nullable: true })
  condition?: Record<string, any>;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: 'PENDING' | 'TRIGGERED' | 'CANCELLED';

  @Column({ type: 'varchar', default: 'EMAIL' })
  notificationType: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  triggeredAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
