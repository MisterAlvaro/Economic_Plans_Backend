import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { EconomicPlan } from './EconomicPlans';
import { User } from './User';

@Entity('plan_audit_log')
export class PlanAuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => EconomicPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan!: EconomicPlan;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  action!: 'create' | 'update' | 'review' | 'approve';

  @Column({ name: 'changed_table', nullable: true })
  changedTable!: string;

  @Column({ name: 'changed_field', nullable: true })
  changedField!: string;

  @Column({ name: 'old_value', nullable: true, type: 'text' })
  oldValue!: string;

  @Column({ name: 'new_value', nullable: true, type: 'text' })
  newValue!: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
