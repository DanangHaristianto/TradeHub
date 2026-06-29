import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('market_data')
@Index(['symbol'])
@Index(['timestamp'])
@Index(['symbol', 'timestamp'])
export class MarketData {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  symbol: string;

  @Column({ type: 'varchar' })
  assetType: 'STOCK' | 'CRYPTO' | 'FOREX' | 'COMMODITY' | 'ETF';

  @Column({ type: 'decimal', precision: 15, scale: 8 })
  open: number;

  @Column({ type: 'decimal', precision: 15, scale: 8 })
  high: number;

  @Column({ type: 'decimal', precision: 15, scale: 8 })
  low: number;

  @Column({ type: 'decimal', precision: 15, scale: 8 })
  close: number;

  @Column({ type: 'decimal', precision: 15, scale: 8 })
  volume: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  marketCap?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  change?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  changePercent?: number;

  @Column({ type: 'varchar', default: '1H' })
  timeframe: '1M' | '5M' | '15M' | '1H' | '4H' | '1D' | '1W' | '1MO';

  @Column({ type: 'simple-json', nullable: true })
  technicalIndicators?: {
    sma20?: number;
    sma50?: number;
    sma200?: number;
    rsi?: number;
    macd?: number;
    bollingerBands?: { upper: number; middle: number; lower: number };
  };

  @CreateDateColumn()
  timestamp: Date;
}
