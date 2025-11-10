import { Router } from 'express';
import tourController from '../controllers/tourController.ts';
const tourRouter = Router();

tourRouter
  .get('/', tourController.getAllTours)
  .get('/:id', tourController.getTour)
  .post('/', tourController.createTour)
  .put('/:id', tourController.updateTour)
  .delete('/:id', tourController.deleteTour);

export default tourRouter;
