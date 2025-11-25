import type { ErrorRequestHandler, Response } from 'express';
import { env } from '../envSchema.ts';
import type { AppError } from '../models/ApiModels.ts';

const sendProductionError = (error: AppError, res: Response) => {
  const errorStatusCode = error.isOperational ? error.statusCode : 500;
  const errorMessage = error.isOperational ? error.message : 'Something went very wrong!';

  res.status(errorStatusCode).json({
    status: 'error',
    message: errorMessage,
  });
};

const sendDevelopmentError = (error: AppError, res: Response) => {
  res.status(error.statusCode).json({
    status: 'error',
    error,
    message: error.message,
    stack: error.stack,
  });
};

export const errorController: ErrorRequestHandler = (err, _req, res) => {
  const environment = env.ENVIRONMENT;

  if (environment === 'development') {
    sendDevelopmentError(err, res);
  } else {
    sendProductionError(err, res);
  }
};
