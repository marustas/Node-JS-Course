import type { RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../models/ApiModels.ts';

export const validateBody =
  <S extends z.ZodType>(schema: S): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.issues
        .map((i) => `${i.path.join('.') || 'body'}: ${i.message}`)
        .join('; ');
      return next(new AppError(`Invalid request body: ${message}`, 400));
    }

    req.body = parsed.data;
    next();
  };
