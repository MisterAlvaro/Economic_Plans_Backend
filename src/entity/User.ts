import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne,
    CreateDateColumn, UpdateDateColumn, JoinColumn
  } from 'typeorm';
  import { Division } from './Division';
  
  @Entity('users')
  export class User {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ unique: true, nullable: true })
    email!: string;
  
      @Column({ name: 'password_hash', nullable: true })
  passwordHash!: string;
  
    @Column({ name: 'full_name', length: 100 })
    fullName!: string;
  
      @ManyToOne(() => Division, division => division.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'division_id' })
  division!: Division;
  
    @Column()
    role!: 'admin' | 'economist' | 'reviewer';
  
    @Column({ default: true })
    is_active!: boolean;
  
    @Column({ type: 'timestamptz', nullable: true })
    last_login!: Date;
  
    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;
  }
  