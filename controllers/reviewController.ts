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

const updateReview: RequestHandler<
  { id: string },
  ResponsePayload<Review>,
  Partial<Pick<Review, 'rating' | 'review'>>,
  null
> = async (req, res, next) => {
  const reviewToUpdate = await ReviewModel.findById(req.params.id);

  if (!reviewToUpdate) {
    return next(new AppError('Review not found', 404));
  }

  if (reviewToUpdate.isOwnReview(req.user._id)) {
    return next(new AppError('You do not have permission to update this review', 403));
  }

  const updatedReview = await ReviewModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedReview) {
    return next(new AppError('Failed to update review', 400));
  }

  res.status(200).json({
    status: 'success',
    data: updatedReview,
  });
};

const deleteReview: RequestHandler<{ id: string }, ResponsePayload<null>, null, null> = async (
  req,
  res,
  next
) => {
  const reviewToDelete = await ReviewModel.findById(req.params.id);

  if (!reviewToDelete) {
    return next(new AppError('Review not found', 404));
  }

  if (reviewToDelete.isOwnReview(req.user._id)) {
    return next(new AppError('You do not have permission to delete this review', 403));
  }

  const deletedReview = await ReviewModel.findByIdAndDelete(req.params.id);

  if (!deletedReview) {
    return next(new AppError('Failed to delete review', 400));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

export const reviewController = {
  createReview: catchAsync(createReview),
  getAllReviews: catchAsync(getAllReviews),
  updateReview: catchAsync(updateReview),
  deleteReview: catchAsync(deleteReview),
};
