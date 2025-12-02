import type { RequestHandler } from 'express';
import type { Model } from 'mongoose';
import { catchAsync } from './catchAsync.ts';
import { AppError, type ResponsePayload } from '../models/ApiModels.ts';

export const deleteRequestHandler = <TModel, TParams extends { id: string }, TRes, TReq>(
  model: Model<TModel>,
  errorMessage: string = 'Document not found'
): RequestHandler<TParams, ResponsePayload<TRes | null>, TReq> =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedDocument = await model.findByIdAndDelete(id);

    if (!deletedDocument) {
      return next(new AppError(errorMessage, 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
