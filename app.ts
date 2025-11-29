import express from 'express';
import tourRouter from './routes/tourRouter.ts';
import { errorController } from './controllers/errorController.ts';
import authRouter from './routes/authRouter.ts';
import rateLimit from 'express-rate-limit';

const app = express();

const limiter = rateLimit({
  max: 100, // 100 requests per window time
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api', limiter);

app.use(express.json());
app.use('/api/tours', tourRouter);
app.use('/api/auth', authRouter);

app.use(errorController);

export default app;
