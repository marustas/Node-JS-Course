import type { RequestHandler } from 'express';
import { ObjectId } from 'mongodb';
import type { ResponsePayload } from '../models/ApiModels.ts';
import { BookingModel, type Booking } from '../models/bookingModel.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import { createRequestHandler } from '../utils/createRequestHandler.ts';
import { deleteRequestHandler } from '../utils/deleteRequestHandler.ts';
import { getRequestHandlerSingle } from '../utils/getRequestHandler.ts';
import { updateRequestHandler } from '../utils/updateRequestHandler.ts';

const createBooking = createRequestHandler(BookingModel, 'Failed to create booking');

const updateBooking = updateRequestHandler(BookingModel, 'Booking not found');

const deleteBooking = deleteRequestHandler(BookingModel, 'Booking not found');

const getAllBookings: RequestHandler<
  { tourId?: string },
  ResponsePayload<Booking[]>,
  null,
  null
> = async (req, res) => {
  const { tourId } = req.params;
  const bookings = await BookingModel.find(tourId ? { tour: new ObjectId(tourId) } : {});

  res.status(200).json({
    status: 'success',
    data: bookings,
  });
};

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
