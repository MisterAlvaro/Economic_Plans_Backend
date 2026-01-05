import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PlanSheet } from './PlanSheets';

@Entity('formula_cells')
export class FormulaCell {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PlanSheet, sheet => sheet.formulaCells, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sheet_id' })
  sheet!: PlanSheet;

  @Column({ name: "cell_reference" })
  cellReference!: string;

  @Column('text')
  formula!: string;

  @Column('text', { array: true })
  depends_on!: string[];

  @Column('numeric', { precision: 15, scale: 2, nullable: true })
  last_value!: number;

  @Column({ type: 'timestamptz', nullable: true })
  last_calculated_at!: Date;
}
