import express from 'express';
import tourRouter from './routes/tourRouter.ts';

const app = express();

app.use(express.json());
app.use('/api/toures', tourRouter);

export default app;
