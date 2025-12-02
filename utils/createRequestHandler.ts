import type { RequestHandler } from 'express';
import type { Model } from 'mongoose';
import { catchAsync } from './catchAsync.ts';
import { AppError, type ResponsePayload } from '../models/ApiModels.ts';

export const createRequestHandler = <TModel, TReq extends Partial<TModel> = Partial<TModel>>(
  model: Model<TModel>,
  errorMessage: string = 'Document not created'
): RequestHandler<null, ResponsePayload<TModel>, TReq, null> =>
  catchAsync(async (req, res, next) => {
    const createdDocument = await model.create(req.body);

    if (!createdDocument) {
      return next(new AppError(errorMessage, 404));
    }

    res.status(201).json({
      status: 'success',
      data: createdDocument,
    });
  });
