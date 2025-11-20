import type { ErrorRequestHandler } from 'express';
import { env } from '../envSchema.ts';

export const errorController: ErrorRequestHandler<null, unknown, null> = (err, req, res) => {
  const statusCode = err.statusCode || 500;
  const environment = env.ENVIRONMENT;
  const message = err.message || 'Internal Server Error';

  if (environment === 'development') {
    res.status(statusCode).json({
      status: 'error',
      message,
      stack: err.stack,
    });
  } else {
    res.status(statusCode).json({
      status: 'error',
      message,
    });
  }
};
