import { Router } from 'express';

import { UserRole } from '../models/userModel.ts';
import { authController } from '../controllers/authController.ts';
import { reviewController } from '../controllers/reviewController.ts';

export const reviewRouter = Router({ mergeParams: true }); // required to get access to params from parent router

reviewRouter.use(authController.protect, authController.restrictTo(UserRole.USER, UserRole.ADMIN));

reviewRouter.route('/').get(reviewController.getAllReviews).post(reviewController.createReview);
