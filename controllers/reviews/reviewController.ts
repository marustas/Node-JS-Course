import type { RequestHandler } from 'express';
import { ReviewModel, type Review } from '../../models/reviewModel.ts';
import { AppError, type ResponsePayload } from '../../models/ApiModels.ts';
import { catchAsync } from '../../utils/catchAsync.ts';

const getAllReviews: RequestHandler<null, ResponsePayload<Review[]>, null, null> = async (
  req,
  res
) => {
  const reviews = await ReviewModel.find();

  res.status(200).json({
    status: 'success',
    data: reviews,
  });
};

const createReview: RequestHandler<null, ResponsePayload<Review>, Review, null> = async (
  req,
  res,
  next
) => {
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
