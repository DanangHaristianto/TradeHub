import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('strategies')
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
export class Strategy {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', default: 'MANUAL' })
  type: 'MANUAL' | 'AUTOMATED' | 'SEMI_AUTOMATED';

  @Column({ type: 'text' })
  logic: string;

  @Column({ type: 'varchar', default: 'DRAFT' })
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

  @Column({ type: 'simple-array' })
  targetSymbols: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  capital: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 2 })
  riskPerTrade: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  leverage: number;

  @Column({ type: 'integer', default: 0 })
  successRate: number;

  @Column({ type: 'integer', default: 0 })
  totalTrades: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  profitLoss: number;

  @Column({ type: 'simple-json', nullable: true })
  parameters?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  backtest?: {
    startDate: Date;
    endDate: Date;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
