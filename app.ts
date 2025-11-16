import express from 'express';
import tourRouter from './routes/tourRouter.ts';

const app = express();

app.use(express.json());
app.use('/api/tours', tourRouter);

export default app;
