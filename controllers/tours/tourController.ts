import type { RequestHandler } from 'express';
import type { Tour } from '../../models/tourModel.ts';
import type { ResponsePayload } from '../../models/ApiResponse.ts';

import TourModel from '../../models/tourModel.ts';
import TourQuery, { type TourQueryFeatures } from './tourQuery.ts';
import type { FilterQuery, PipelineStage } from 'mongoose';

interface TourParams {
  id: string;
}

interface AggregatorData {
  avgRating: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

const getAllTours: RequestHandler<null, ResponsePayload<Tour[]>, null, TourQueryFeatures> = async (
  req,
  res
) => {
  const tourQuery = new TourQuery(TourModel.find(), req.query).filter().sort().paginate();

  const filteredTours = await tourQuery.getQuery();

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

const createTour: RequestHandler<null, ResponsePayload<Tour>, Tour, null> = async (req, res) => {
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

const updateTour: RequestHandler<TourParams, ResponsePayload<Tour>, Tour, null> = async (
  req,
  res
) => {
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

const aliasTopTours: RequestHandler<null, ResponsePayload<Tour[]>, null, TourQueryFeatures> = (
  req,
  _,
  next
) => {
  req.query.limit = 5;
  req.query.sortBy = 'price:asc';
  next();
};

export const getTourStats: RequestHandler<
  null,
  ResponsePayload<AggregatorData[]>,
  null,
  null
> = async (_, res) => {
  const stats = await TourModel.aggregate<AggregatorData>([
    {
      $match: { ratingsAverage: { $gte: 4.5 } } satisfies FilterQuery<Tour>,
    } satisfies PipelineStage.Match,
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    } satisfies PipelineStage.Group,
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
};

const tourController = {
  aliasTopTours,
  getTourStats,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
};

export default tourController;
