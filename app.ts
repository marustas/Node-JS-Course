import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import tourRouter from './routes/tourRouter.ts';
import type { AppError, ResponsePayload } from './models/ApiModels.ts';

const app = express();

app.use(express.json());
app.use('/api/tours', tourRouter);

const errorHandler: ErrorRequestHandler<null, ResponsePayload<null>, null> = (
  err: AppError,
  req,
  res,
  next
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    status: 'error',
    message,
  });
};

export const catchAsync =
  <P = unknown, ResBody = unknown, ReqBody = unknown, ReqQuery = unknown>(
    fn: RequestHandler<P, ResBody, ReqBody, ReqQuery>
  ): RequestHandler<P, ResBody, ReqBody, ReqQuery> =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

app.use(errorHandler);

export default app;
