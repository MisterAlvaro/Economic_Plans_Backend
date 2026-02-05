// src/index.ts – arranque local (DB + listen)
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import { InitializationService } from './services/InitializationService';
import app from './app';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

AppDataSource.initialize()
  .then(async () => {
    console.log('Connected to database');
    await InitializationService.initializeDefaultData();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.error(error));