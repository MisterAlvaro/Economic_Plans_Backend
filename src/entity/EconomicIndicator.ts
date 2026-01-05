import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('economic_indicators')
export class EconomicIndicator {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 30, unique: true })
  code!: string;

  @Column({ length: 10, nullable: true })
  unit!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'formula_template', type: 'text', nullable: true })
  formulaTemplate!: string;
}
