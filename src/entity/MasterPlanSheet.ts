import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { MasterPlan } from './MasterPlan';

@Entity('master_plan_sheets')
@Unique(['master_plan', 'sheet_name'])
export class MasterPlanSheet {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => MasterPlan, (masterPlan) => masterPlan.sheets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'master_plan_id' })
  master_plan!: MasterPlan;

  @Column({ length: 50 })
  sheet_name!: string;

  @Column({ type: 'jsonb' })
  data!: unknown;
}
