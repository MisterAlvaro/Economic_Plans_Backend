import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { EconomicPlan } from './EconomicPlans';
import { User } from './User';

@Entity('ai_reajuste_history')
export class AIReajusteHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => EconomicPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan!: EconomicPlan;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'requested_by' })
  requested_by!: User | null;

  @Column({ name: 'model_name', length: 80 })
  model_name!: string;

  @Column({ type: 'jsonb', nullable: true })
  context!: unknown;

  @Column({ type: 'text' })
  recommendation!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
