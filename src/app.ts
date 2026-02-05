// src/app.ts – Express app sin listen ni DB (para local + Vercel serverless)
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get('/', (_req, res) => res.json({ status: 'ok', api: '/api' }));
app.use('/api', routes);

export default app;
