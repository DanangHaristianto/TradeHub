import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('transactions')
@Index(['portfolioId'])
@Index(['type'])
@Index(['createdAt'])
@Index(['portfolioId', 'createdAt'])
export class Transaction {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  portfolioId: string;

  @Column({ type: 'uuid', nullable: true })
  orderId?: string;

  @Column({ type: 'varchar' })
  type: 'BUY' | 'SELL' | 'SHORT' | 'COVER' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'INTEREST';

  @Column({ type: 'varchar', nullable: true })
  symbol?: string;

  @Column({ type: 'varchar', nullable: true })
  assetType?: 'STOCK' | 'CRYPTO' | 'FOREX' | 'COMMODITY' | 'ETF';

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  quantity?: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, nullable: true })
  price?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  fee?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  tax?: number;

  @Column({ type: 'varchar', default: 'COMPLETED' })
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
