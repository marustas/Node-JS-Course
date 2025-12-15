import { Router } from 'express';

import { UserRole } from '../models/userModel.ts';
import { authController } from '../controllers/authController.ts';
import { bookingController } from '../controllers/bookingController.ts';

const bookingRouter = Router({ mergeParams: true });

bookingRouter.use(
  authController.protect,
  authController.restrictTo(UserRole.ADMIN, UserRole.LEAD_GUIDE)
);

bookingRouter.get('/', bookingController.getAllBookings);
bookingRouter.post('/', bookingController.createBooking);

bookingRouter
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

export default bookingRouter;
