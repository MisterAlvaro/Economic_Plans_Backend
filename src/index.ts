// src/index.ts
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { AppDataSource } from './data-source';
import routes from './routes';
import { InitializationService } from './services/InitializationService';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({
  origin: true, // Permite cualquier origen en desarrollo
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// API routes
app.use('/api', routes);

AppDataSource.initialize().then(async () => {
  console.log('Connected to database');
  
  // Inicializar datos por defecto
  await InitializationService.initializeDefaultData();
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(error => console.log(error));