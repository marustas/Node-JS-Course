import express from 'express';
import tourRouter from './routes/tourRouter.ts';
import { errorController } from './controllers/errorController.ts';
import authRouter from './routes/authRouter.ts';

const app = express();

app.use(express.json());
app.use('/api/tours', tourRouter);
app.use('/api/auth', authRouter);

app.use(errorController);

export default app;
