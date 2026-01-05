import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Unique, JoinColumn } from 'typeorm';
import { EconomicPlan } from './EconomicPlans';
import { FormulaCell } from './FormulaCell';

@Entity('plan_sheets')
@Unique(['plan', 'sheetName'])
export class PlanSheet {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => EconomicPlan, plan => plan.sheets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan!: EconomicPlan;

  @Column({ name: "sheet_name", length: 50 })
  sheetName!: string;

  @Column({ type: 'jsonb' })
  data!: any;

  @OneToMany(() => FormulaCell, cell => cell.sheet)
  formulaCells!: FormulaCell[];
}
