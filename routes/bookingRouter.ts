import { Router } from 'express';

import { UserRole } from '../models/userModel.ts';
import { authController } from '../controllers/authController.ts';
import { bookingController } from '../controllers/bookingController.ts';
import { z } from 'zod';
import { validateBody } from '../utils/validateRequestBody.ts';
import { Types } from 'mongoose';

const objectIdSchema = z.string().transform((val) => {
  if (!Types.ObjectId.isValid(val)) {
    throw new Error('Invalid ObjectId');
  }
  return new Types.ObjectId(val);
});

const updateBookingRequestBodySchema = z
  .object({
    price: z.number().min(0),
    user: objectIdSchema,
    tour: objectIdSchema,
  })
  .partial()
  .strict();

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
  .patch(validateBody(updateBookingRequestBodySchema), bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

export default bookingRouter;
