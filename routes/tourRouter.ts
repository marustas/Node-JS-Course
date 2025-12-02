import { Router } from 'express';
import tourController from '../controllers/tours/tourController.ts';
import { authController } from '../controllers/auth/authController.ts';
import { UserRole } from '../models/userModel.ts';
import { reviewRouter } from './reviewRouter.ts';

const tourRouter = Router();

tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter.route('/tour-monthly-plan/:year').get(tourController.getMonthlyPlan);

tourRouter.all('', authController.protect);

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter
  .get('/', tourController.getAllTours)
  .get('/:id', tourController.getTour)
  .post('/', authController.restrictTo(UserRole.ADMIN), tourController.createTour)
  .put('/:id', authController.restrictTo(UserRole.ADMIN), tourController.updateTour)
  .delete('/:id', authController.restrictTo(UserRole.ADMIN), tourController.deleteTour);

tourRouter.all('', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export default tourRouter;
