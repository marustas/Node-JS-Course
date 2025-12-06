import { Router } from 'express';
import { reviewController } from '../controllers/reviews/reviewController.ts';
import { authController } from '../controllers/auth/authController.ts';
import { UserRole } from '../models/userModel.ts';

export const reviewRouter = Router({ mergeParams: true }); // required to get access to params from parent router

reviewRouter.use(authController.protect, authController.restrictTo(UserRole.USER, UserRole.ADMIN));

reviewRouter.route('/').get(reviewController.getAllReviews).post(reviewController.createReview);
