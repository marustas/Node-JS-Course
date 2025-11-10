import type { ResponsePayload } from '../models/ApiResponse.ts';
import TourModel from '../models/tourModel.ts';
import type { Tour } from '../models/tourModel.ts';
import type { Request, Response } from 'express';

export const getAllTours = async () => {};

export const getTour = async () => {};

export const createTour = async (
  req: Request<null, Tour, Tour, null>,
  res: Response<ResponsePayload<Tour>>
) => {
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

export const updateTour = async () => {};

export const deleteTour = async () => {};
