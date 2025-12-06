import type { RequestHandler } from 'express';

import { AppError, type ResponsePayload } from '../../models/ApiModels.ts';

import { type FilterQuery, type PipelineStage } from 'mongoose';
import { catchAsync } from '../../utils/catchAsync.ts';
import TourModel, { type Tour } from '../../models/tourModel.ts';

import { deleteRequestHandler } from '../../utils/deleteRequestHandler.ts';
import { updateRequestHandler } from '../../utils/updateRequestHandler.ts';
import { createRequestHandler } from '../../utils/createRequestHandler.ts';
import { getRequestHandler, getRequestHandlerSingle } from '../../utils/getRequestHandler.ts';

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

type TourFilters = Required<
  Omit<
    Tour,
    | 'summary'
    | 'description'
    | 'imageCover'
    | 'images'
    | 'startDates'
    | 'createdAt'
    | 'locations'
    | 'startLocation'
  >
>;

type Direction = 'asc' | 'desc';

interface TourQueryFeatures extends TourFilters {
  page?: number;
  limit?: number;
  sortBy: `${keyof TourFilters}:${Direction}`;
}

const getAllTours = getRequestHandler(TourModel, {
  query: true,
});

const getTour = getRequestHandlerSingle<Tour, TourParams, Tour>(TourModel, 'Tour not found', {
  populate: 'reviews',
});

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

interface GeoTourParams {
  distance: string;
  latlng: string;
  unit: 'mi' | 'km';
}

const getToursWithin: RequestHandler<GeoTourParams, ResponsePayload<Tour[]>, null, null> = async (
  req,
  res,
  next
) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? parseFloat(distance) / 3963.2 : parseFloat(distance) / 6378.1;

  if (!lat || !lng) {
    return next(new AppError('Please provide latitude and longitude in the format lat,lng.'));
  }

  const tours = await TourModel.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    data: tours,
  });
};

const getDistances: RequestHandler<
  { latlng: string; unit: 'mi' | 'km' },
  ResponsePayload<{ distance: number; name: string }[]>,
  null,
  null
> = async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(new AppError('Please provide latitude and longitude in the format lat,lng.'));
  }

  const distances = await TourModel.aggregate<{ distance: number; name: string }>([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        distanceField: 'distance',
        distanceMultiplier: unit === 'mi' ? 0.000621371 : 0.001,
      },
    } satisfies PipelineStage.GeoNear,
    {
      $project: {
        distance: 1,
        name: 1,
      },
    } satisfies PipelineStage.Project,
  ]);

  res.status(200).json({
    status: 'success',
    data: distances,
  });
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
  getToursWithin: catchAsync(getToursWithin),
  getDistances: catchAsync(getDistances),
};

export default tourController;
