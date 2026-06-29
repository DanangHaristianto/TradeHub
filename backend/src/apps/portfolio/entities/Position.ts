import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('positions')
@Index(['portfolioId'])
@Index(['symbol'])
@Index(['portfolioId', 'symbol'])
export class Position {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  portfolioId: string;

  @Column({ type: 'varchar' })
  symbol: string;

  @Column({ type: 'varchar' })
  assetType: 'STOCK' | 'CRYPTO' | 'FOREX' | 'COMMODITY' | 'ETF';

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 8 })
  averagePrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 8 })
  currentPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  marketValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  gainLoss: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  gainLossPercent: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, nullable: true })
  stopLossPrice?: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, nullable: true })
  takeProfitPrice?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  leverage: number;

  @Column({ type: 'varchar', default: 'LONG' })
  positionType: 'LONG' | 'SHORT';

  @Column({ type: 'timestamp', nullable: true })
  openedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt?: Date;

  @Column({ type: 'varchar', default: 'OPEN' })
  status: 'OPEN' | 'CLOSED' | 'PENDING';

  @Column({ type: 'simple-json', nullable: true })
  tags?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
