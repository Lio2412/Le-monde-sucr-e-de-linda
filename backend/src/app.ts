import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

export { app }; 