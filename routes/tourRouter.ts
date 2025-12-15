import { Router } from 'express';

import { UserRole } from '../models/userModel.ts';
import { reviewRouter } from './reviewRouter.ts';
import bookingRouter from './bookingRouter.ts';
import { authController } from '../controllers/authController.ts';
import tourController from '../controllers/tourController.ts';

const tourRouter = Router();

tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter.route('/tour-monthly-plan/:year').get(tourController.getMonthlyPlan);

tourRouter.get('/', tourController.getAllTours).get('/:id', tourController.getTour);

tourRouter.use(authController.protect);

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter.use('/:tourId/bookings', bookingRouter);

tourRouter
  .post('/', authController.restrictTo(UserRole.ADMIN), tourController.createTour)
  .put('/:id', authController.restrictTo(UserRole.ADMIN), tourController.updateTour)
  .delete('/:id', authController.restrictTo(UserRole.ADMIN), tourController.deleteTour);

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

tourRouter.get('/distances/:latlng', tourController.getDistances);

tourRouter.all('', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export default tourRouter;
