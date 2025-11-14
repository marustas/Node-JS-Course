import type { ResponsePayload } from '../models/ApiResponse.ts';
import TourModel from '../models/tourModel.ts';
import type { Tour } from '../models/tourModel.ts';
import type { Request, RequestHandler } from 'express';
import { parseOperators } from '../utils/parseQueryOperator.ts';

type Direction = 'asc' | 'desc';

interface TourParams {
  id: string;
}

type TourFilters = Required<
  Omit<Tour, 'summary' | 'description' | 'imageCover' | 'images' | 'startDates' | 'createdAt'>
>;

interface TourQuery extends TourFilters {
  page?: string;
  limit?: string;
  sortBy: `${keyof TourFilters}:${Direction}`;
}

const getAllTours: RequestHandler<null, ResponsePayload<Tour[]>, null, TourQuery> = async (
  req,
  res
) => {
  const { query } = req;
  const { limit, page, sortBy, ...filters } = query;

  const filterQuery = parseOperators<TourFilters>(filters);
  console.log('Filter Query:', filterQuery);

  let tourQuery = TourModel.find(filterQuery);

  if (limit) {
    const limitNumber = parseInt(limit, 10);
    tourQuery = tourQuery.limit(limitNumber);
  }

  if (page) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const skip = (pageNumber - 1) * limitNumber;
    const queriedDocuments = await TourModel.countDocuments();

    if (skip >= queriedDocuments) {
      return res.status(400).json({
        status: 'error',
        message: 'Page number exceeds total number of documents',
      });
    }
    tourQuery = tourQuery.skip(skip);
  }

  if (sortBy) {
    const [sortField, direction] = sortBy.split(':');
    const sortDirection = direction === 'desc' ? -1 : 1;

    if (sortField) {
      tourQuery = tourQuery.sort({ [sortField]: sortDirection, _id: 1 });
    }
  }

  const filteredTours = await tourQuery;

  res.status(200).json({
    status: 'success',
    data: filteredTours,
  });
};

const getTour: RequestHandler<TourParams, ResponsePayload<Tour>, null, null> = async (req, res) => {
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

const updateTour: RequestHandler<
  TourParams,
  ResponsePayload<Tour>,
  Request<null, Tour, Tour, null>,
  null
> = async (req, res) => {
  const { id } = req.params;

  const updatedTour = await TourModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour) {
    return res.status(404).json({
      status: 'error',
      message: 'Tour not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: updatedTour,
  });
};

const deleteTour: RequestHandler<TourParams, ResponsePayload<null>, null, null> = async (
  req,
  res
) => {
  const { id } = req.params;

  const deletedTour = await TourModel.findByIdAndDelete(id);

  if (!deletedTour) {
    return res.status(404).json({
      status: 'error',
      message: 'Tour not found',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const tourController = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
};

export default tourController;
