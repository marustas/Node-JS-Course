import express, { type RequestHandler } from 'express';
import tourRouter from './routes/tourRouter.ts';
import { errorController } from './controllers/errorController.ts';
import authRouter from './routes/authRouter.ts';

const app = express();

app.use(express.json());
app.use('/api/tours', tourRouter);
app.use('/api/auth', authRouter);

export const catchAsync =
  <P = unknown, ResBody = unknown, ReqBody = unknown, ReqQuery = unknown>(
    fn: RequestHandler<P, ResBody, ReqBody, ReqQuery>
  ): RequestHandler<P, ResBody, ReqBody, ReqQuery> =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

app.use(errorController);

export default app;
