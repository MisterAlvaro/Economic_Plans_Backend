import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { MasterPlanSheet } from './MasterPlanSheet';
import { EconomicPlan } from './EconomicPlans';

@Entity('master_plans')
export class MasterPlan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  year!: number;

  @Column({ default: 'draft' })
  status!: 'draft' | 'active';

  @Column({ name: 'file_name', nullable: true })
  file_name!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  created_by!: User;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at!: Date;

  @OneToMany(() => MasterPlanSheet, (sheet) => sheet.master_plan)
  sheets!: MasterPlanSheet[];

  @OneToMany(() => EconomicPlan, (plan) => plan.master_plan)
  division_plans!: EconomicPlan[];
}
