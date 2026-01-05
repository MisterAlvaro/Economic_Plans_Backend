import { DataSource } from 'typeorm';
import ormconfig from '../ormconfig.json';

export const AppDataSource = new DataSource(ormconfig as any); 