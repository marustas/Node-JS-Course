import { catchAsync } from '../../utils/catchAsync.ts';
import { createRequestHandler } from '../../utils/createRequestHandler.ts';
import { BookingModel } from '../../models/bookingModel.ts';
import { updateRequestHandler } from '../../utils/updateRequestHandler.ts';
import { deleteRequestHandler } from '../../utils/deleteRequestHandler.ts';
import { getRequestHandler, getRequestHandlerSingle } from '../../utils/getRequestHandler.ts';

const createBooking = createRequestHandler(BookingModel, 'Failed to create booking');

const updateBooking = updateRequestHandler(BookingModel, 'Booking not found');

const deleteBooking = deleteRequestHandler(BookingModel, 'Booking not found');

const getAllBookings = getRequestHandler(BookingModel);

const getBooking = getRequestHandlerSingle(BookingModel, 'Booking not found', {
  populate: 'user tour',
});

export const bookingController = {
  createBooking: catchAsync(createBooking),
  updateBooking: catchAsync(updateBooking),
  deleteBooking: catchAsync(deleteBooking),
  getBooking: catchAsync(getBooking),
  getAllBookings: catchAsync(getAllBookings),
};
