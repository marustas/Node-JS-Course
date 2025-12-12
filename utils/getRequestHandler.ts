import type { RequestHandler } from 'express';
import type { Model } from 'mongoose';
import { catchAsync } from './catchAsync.ts';
import { AppError, type ResponsePayload } from '../models/ApiModels.ts';
import RequestQuery, { type QueryFeatures } from './query.ts';

export const getRequestHandlerSingle = <
  TModel,
  TParams extends { id: string },
  TReq extends Partial<TModel> = Partial<TModel>,
>(
  model: Model<TModel>,
  errorMessage: string = 'Document not found',
  options?: {
    populate: string;
  }
): RequestHandler<TParams, ResponsePayload<TModel>, TReq, null> =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    let query = model.findById(id);
    if (options?.populate) {
      query = query.populate(options.populate);
    }

    const foundDocument = await query;

    if (!foundDocument) {
      return next(new AppError(errorMessage, 404));
    }

    res.status(200).json({
      status: 'success',
      data: foundDocument,
    });
  });

export const getRequestHandler = <TModel>(
  model: Model<TModel>,
  options?: {
    query: boolean;
  }
): RequestHandler<null, ResponsePayload<TModel[]>, null, QueryFeatures> =>
  catchAsync(async (req, res) => {
    let documents = await model.find();
    if (options?.query) {
      const tourQuery = new RequestQuery(model.find(), req.query).filter().sort().paginate();
      documents = await tourQuery.getQuery();
    }

    res.status(200).json({
      status: 'success',
      data: documents,
    });
  });
