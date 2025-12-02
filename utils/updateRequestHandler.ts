import type { RequestHandler } from 'express';
import type { Model } from 'mongoose';
import { catchAsync } from './catchAsync.ts';
import { AppError, type ResponsePayload } from '../models/ApiModels.ts';

export const updateRequestHandler = <
  TModel,
  TParams extends { id: string },
  TReq extends Partial<TModel> = Partial<TModel>,
>(
  model: Model<TModel>,
  errorMessage: string = 'Document not found'
): RequestHandler<TParams, ResponsePayload<TModel>, TReq, null> =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updatedDocument = await model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDocument) {
      return next(new AppError(errorMessage, 404));
    }

    res.status(200).json({
      status: 'success',
      data: updatedDocument,
    });
  });
