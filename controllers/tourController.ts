import type { ResponsePayload } from '../models/ApiResponse.ts';
import TourModel from '../models/tourModel.ts';
import type { Tour } from '../models/tourModel.ts';
import type { Request, RequestHandler } from 'express';

interface GetTourParams {
  id: string;
}

const getAllTours: RequestHandler<null, ResponsePayload<Tour[]>, null, null> = async (req, res) => {
  const allTours = await TourModel.find();

  res.status(200).json({
    status: 'success',
    data: allTours,
  });
};

const getTour: RequestHandler<GetTourParams, ResponsePayload<Tour>, null, null> = async (
  req,
  res
) => {
  const { id } = req.params;

  const tour = await TourModel.findById(id);

  if (!tour) {
    return res.status(404).json({
      status: 'error',
      message: 'Tour not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: tour,
  });
};

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
