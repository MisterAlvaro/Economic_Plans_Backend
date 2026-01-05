import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('revoked_tokens')
export class RevokedToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  token!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;
} 