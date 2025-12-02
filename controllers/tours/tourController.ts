import type { RequestHandler } from 'express';

import { AppError, type ResponsePayload } from '../../models/ApiModels.ts';

import TourQuery, { type TourQueryFeatures } from './tourQuery.ts';
import type { FilterQuery, PipelineStage } from 'mongoose';
import { catchAsync } from '../../utils/catchAsync.ts';
import TourModel, { type Tour } from '../../models/tourModel.ts';
import type { Review } from '../../models/reviewModel.ts';
import { deleteRequestHandler } from '../../utils/deleteRequestHandler.ts';
import { updateRequestHandler } from '../../utils/updateRequestHandler.ts';
import { createRequestHandler } from '../../utils/createRequestHandler.ts';

interface TourParams {
  id: string;
}

interface AggregatorData {
  avgRating: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

interface MonthlyPlan {
  month: number;
  monthLabel: string;
  numTours: number;
  tours: string[];
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

const getTour: RequestHandler<TourParams, ResponsePayload<Tour>, null, null> = async (
  req,
  res,
  next
) => {
  const { id } = req.params;

  const tour = await TourModel.findById(id).populate<{ reviews: Review[] }>('reviews');

  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: tour,
  });
};

const createTour = createRequestHandler<Tour, Tour>(TourModel, 'Failed to create tour');

const updateTour = updateRequestHandler<Tour, TourParams, Tour>(TourModel, 'Tour not found');

const deleteTour = deleteRequestHandler<Tour, TourParams, null, null>(TourModel, 'Tour not found');

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
    {
      $sort: {
        avgPrice: 1,
      },
    } satisfies PipelineStage.Sort,
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
};

export const getMonthlyPlan: RequestHandler<
  { year: number },
  ResponsePayload<MonthlyPlan[]>,
  null,
  null
> = async (req, res) => {
  try {
    const year = req.params.year;
    const planForTheYear = await TourModel.aggregate<MonthlyPlan>([
      {
        $unwind: '$startDates',
      } satisfies PipelineStage.Unwind,
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      } satisfies PipelineStage.Match,
      {
        $group: {
          _id: {
            $month: '$startDates',
          },
          numTours: { $sum: 1 },
          tours: { $push: '$name' },
        },
      } satisfies PipelineStage.Group,
      {
        $project: {
          _id: 0,
          month: '$_id',
          monthLabel: {
            $dateToString: {
              format: '%B',
              date: '$startDates',
            },
          },
        },
      } satisfies PipelineStage.Project,
      {
        $sort: { numTours: 1 },
      } satisfies PipelineStage.Sort,
    ]);

    res.status(200).json({
      status: 'success',
      data: planForTheYear,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to get monthly plan',
      error: error,
    });
  }
};

const tourController = {
  aliasTopTours,
  getMonthlyPlan,
  getTourStats,
  getAllTours: catchAsync(getAllTours),
  getTour: catchAsync(getTour),
  createTour: catchAsync(createTour),
  updateTour: catchAsync(updateTour),
  deleteTour: catchAsync(deleteTour),
};

export default tourController;
