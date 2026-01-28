import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Carga variables de entorno (útil en desarrollo y en ejecución local)
dotenv.config();

// Permite seguir usando ormconfig.json como fallback (por ejemplo, para CLI),
// pero en runtime del backend priorizamos las variables de entorno.
let config: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  config = require('../ormconfig.json');
} catch {
  config = {};
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || config.host || 'localhost',
  port: Number(process.env.DB_PORT || config.port || 5432),
  username: process.env.DB_USERNAME || config.username,
  password: process.env.DB_PASSWORD || config.password,
  database: process.env.DB_DATABASE || config.database,
  synchronize: (process.env.DB_SYNCHRONIZE ?? String(config.synchronize)) === 'true',
  logging: (process.env.DB_LOGGING ?? String(config.logging)) === 'true',
  entities: config.entities || ['src/entity/**/*.ts'],
  migrations: config.migrations || ['src/migration/**/*.ts'],
  subscribers: config.subscribers || ['src/subscriber/**/*.ts'],
});