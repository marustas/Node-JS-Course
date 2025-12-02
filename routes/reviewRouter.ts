import { Router } from 'express';
import { reviewController } from '../controllers/reviews/reviewController.ts';
import { authController } from '../controllers/auth/authController.ts';

export const reviewRouter = Router({ mergeParams: true }); // required to get access to params from parent router

reviewRouter.all('', authController.protect);

reviewRouter.route('/').get(reviewController.getAllReviews).post(reviewController.createReview);
