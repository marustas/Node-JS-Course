import { Router } from 'express';

import { UserRole } from '../models/userModel.ts';
import { authController } from '../controllers/authController.ts';
import { reviewController } from '../controllers/reviewController.ts';
import { z } from 'zod';
import { validateBody } from '../utils/validateRequestBody.ts';

const updateReviewRequestBodySchema = z
  .object({
    review: z.string(),
    rating: z.number().min(1).max(5),
  })
  .partial()
  .strict();

export const reviewRouter = Router({ mergeParams: true }); // required to get access to params from parent router

reviewRouter.use(authController.protect, authController.restrictTo(UserRole.USER, UserRole.ADMIN));

reviewRouter.route('/').get(reviewController.getAllReviews).post(reviewController.createReview);

reviewRouter.patch(
  '/:id',
  validateBody(updateReviewRequestBodySchema),
  reviewController.updateReview
);
