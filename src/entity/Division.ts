import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { EconomicPlan } from './EconomicPlans';

@Entity('divisions')
export class Division {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ length: 10, unique: true, nullable: true })
  code!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @OneToMany(() => User, user => user.division)
  users!: User[];

  @OneToMany(() => EconomicPlan, plan => plan.division)
  plans!: EconomicPlan[];
}
