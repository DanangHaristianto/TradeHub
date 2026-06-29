import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';

@Entity('portfolios')
@Index(['userId'])
@Index(['createdAt'])
export class Portfolio {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

  @Column({ type: 'varchar', default: 'MANUAL' })
  type: 'MANUAL' | 'ALGORITHMIC' | 'COPY_TRADING';

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  cashBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  investedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  gainLoss: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  gainLossPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  monthlyReturn: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  yearlyReturn: number;

  @Column({ type: 'integer', default: 0 })
  totalTrades: number;

  @Column({ type: 'integer', default: 0 })
  winningTrades: number;

  @Column({ type: 'integer', default: 0 })
  losingTrades: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  winRate: number;

  @Column({ type: 'simple-json', nullable: true })
  riskProfile?: {
    maxLossPercentage: number;
    maxPositionSize: number;
    maxLeverage: number;
    stopLossPercentage: number;
  };

  @Column({ type: 'simple-json', nullable: true })
  diversification?: {
    stocks: number;
    crypto: number;
    forex: number;
    commodities: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
