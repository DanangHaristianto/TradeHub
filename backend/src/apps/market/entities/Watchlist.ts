import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('watchlists')
@Index(['userId'])
@Index(['createdAt'])
export class Watchlist {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'simple-array' })
  symbols: string[];

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'varchar', default: 'PRIVATE' })
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';

  @Column({ type: 'simple-array', nullable: true })
  sharedWith?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
