import { Router } from 'express';
import tourController from '../controllers/tours/tourController.ts';

const tourRouter = Router();

tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter
  .get('/', tourController.getAllTours)
  .get('/:id', tourController.getTour)
  .post('/', tourController.createTour)
  .put('/:id', tourController.updateTour)
  .delete('/:id', tourController.deleteTour);

export default tourRouter;
