import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('orders')
@Index(['portfolioId'])
@Index(['symbol'])
@Index(['status'])
@Index(['createdAt'])
export class Order {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  portfolioId: string;

  @Column({ type: 'varchar' })
  symbol: string;

  @Column({ type: 'varchar' })
  assetType: 'STOCK' | 'CRYPTO' | 'FOREX' | 'COMMODITY' | 'ETF';

  @Column({ type: 'varchar' })
  orderType: 'BUY' | 'SELL' | 'SHORT' | 'COVER';

  @Column({ type: 'varchar' })
  timeFrame: 'MARKET' | 'LIMIT' | 'STOP' | 'TRAILING_STOP' | 'OCO';

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 8 })
  entryPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, nullable: true })
  stopPrice?: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, nullable: true })
  limitPrice?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  leverage: number;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: 'PENDING' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED';

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  filledQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, nullable: true })
  filledPrice?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  commission: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalCost?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: {
    source: string;
    automatedTrade: boolean;
    strategyName?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  filledAt?: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
