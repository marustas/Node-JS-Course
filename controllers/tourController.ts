import type { ResponsePayload } from '../models/ApiResponse.ts';
import TourModel from '../models/tourModel.ts';
import type { Tour } from '../models/tourModel.ts';
import type { Request, RequestHandler } from 'express';

const getAllTours = async () => {};

const getTour = async () => {};

const createTour: RequestHandler<
  null,
  ResponsePayload<Tour>,
  Request<null, Tour, Tour, null>,
  null
> = async (req, res) => {
  try {
    const newTour = await TourModel.create(req.body);

    res.status(201).json({
      status: 'success',
      data: newTour,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to create tour',
      error: error,
    });
  }
};

const updateTour = async () => {};

const deleteTour = async () => {};

const tourController = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
};

export default tourController;
