import { Router } from 'express';
import tourController from '../controllers/tours/tourController.ts';
import { authController } from '../controllers/auth/authController.ts';

const tourRouter = Router();

tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter.route('/tour-monthly-plan/:year').get(tourController.getMonthlyPlan);

tourRouter.all('', authController.protect);
tourRouter
  .get('/', tourController.getAllTours)
  .get('/:id', tourController.getTour)
  .post('/', tourController.createTour)
  .put('/:id', tourController.updateTour)
  .delete('/:id', tourController.deleteTour);

tourRouter.all('', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export default tourRouter;
