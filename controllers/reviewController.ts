import type { RequestHandler } from 'express';
import { ObjectId } from 'mongodb';
import { AppError, type ResponsePayload } from '../models/ApiModels.ts';
import { ReviewModel, type Review } from '../models/reviewModel.ts';
import { catchAsync } from '../utils/catchAsync.ts';

const getAllReviews: RequestHandler<
  { tourId: string },
  ResponsePayload<Review[]>,
  null,
  null
> = async (req, res) => {
  const { tourId } = req.params;

  const reviews = await ReviewModel.find(tourId ? { tour: new ObjectId(tourId) } : {});

  res.status(200).json({
    status: 'success',
    data: reviews,
  });
};

const createReview: RequestHandler<
  { tourId: string },
  ResponsePayload<Review>,
  Review,
  null
> = async (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = new ObjectId(req.params.tourId);
  }

  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  const newReview = await ReviewModel.create(req.body);

  if (!newReview) {
    return next(new AppError('Failed to create review', 400));
  }

  res.status(201).json({
    status: 'success',
    data: newReview,
  });
};

export const reviewController = {
  createReview: catchAsync(createReview),
  getAllReviews: catchAsync(getAllReviews),
};
