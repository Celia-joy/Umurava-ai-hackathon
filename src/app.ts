// src/app.ts

import express from 'express';
import cors from 'cors';
import { jobsRouter } from './routes/jobs';
import { applicantsRouter } from './routes/applicants';
import { screeningRouter } from './routes/screening';
import { errorHandler } from './middleware/errorHandler';

const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use('/api/jobs', jobsRouter);
app.use('/api/applicants', applicantsRouter);
app.use('/api/screening', screeningRouter);


app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


//app.use(errorHandler);

export { app };