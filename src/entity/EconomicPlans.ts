import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
    CreateDateColumn, UpdateDateColumn, JoinColumn
  } from 'typeorm';
  import { Division } from './Division';
  import { User } from './User';
  import { PlanSheet } from './PlanSheets';
  
  @Entity('economic_plans')
  export class EconomicPlan {
    @PrimaryGeneratedColumn()
    id!: number;
  
      @ManyToOne(() => Division, division => division.plans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'division_id' })
  division!: Division;
  
    @Column()
    year!: number;
  
    @Column({ default: 1 })
    version!: number;
  
    @Column({ nullable: true })
    status!: 'draft' | 'reviewed' | 'approved';
  
      @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  created_by!: User;
  
      @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewed_by!: User;
  
      @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by' })
  approved_by!: User;
  
    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;
  
    @UpdateDateColumn({ type: 'timestamptz', nullable: true })
    updated_at!: Date;
  
    @OneToMany(() => PlanSheet, sheet => sheet.plan)
    sheets!: PlanSheet[];
  }
  