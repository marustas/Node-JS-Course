import { model, Query, Schema, type InferSchemaType, type PipelineStage } from 'mongoose';
import TourModel from './tourModel.ts';
import type { Types } from 'mongoose';

interface AverageRatingsResult {
  _id: Schema.Types.ObjectId;
  averageRating: number;
  ratingQuantity: number;
}

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must have text'],
    },
    rating: {
      type: Number,
      required: [true, 'A review must have a rating'],
      min: [1, 'Rating must be at least 1.0'],
      max: [5, 'Rating must be at most 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    statics: {
      calcAverageRatings: async function (tourId: Types.ObjectId) {
        const result = await this.aggregate<AverageRatingsResult>([
          {
            $match: { tour: tourId },
          } satisfies PipelineStage.Match,
          {
            $group: {
              _id: '$tour',
              averageRating: { $avg: '$rating' },
              ratingQuantity: { $sum: 1 },
            },
          } satisfies PipelineStage.Group,
        ]);

        if (result[0] !== undefined) {
          await TourModel.findByIdAndUpdate(tourId, {
            ratingAverage: result.length > 0 ? result[0].averageRating : 0,
            ratingQuantity: result.length > 0 ? result[0].ratingQuantity : 0,
          });
        }
      },
    },
    methods: {
      isOwnReview: function (userId: Types.ObjectId) {
        return this.user === userId;
      },
    },
  }
);

export type Review = InferSchemaType<typeof reviewSchema>;

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post('save', function () {
  const reviewModel = this.constructor as typeof ReviewModel;
  reviewModel.calcAverageRatings(this.tour);
});

reviewSchema.pre(['find', 'findOne'], async function (next) {
  this.populate({ path: 'user', select: '-__v -passwordChangedAt -photo' });
  next();
});

reviewSchema.pre(['findOneAndDelete', 'findOneAndUpdate'], async function (next) {
  this._reviewDoc = await this.findOne();
  next();
});

reviewSchema.post(
  ['findOneAndUpdate', 'findOneAndDelete'],
  async function (this: Query<null, Review>) {
    const reviewModel = this.constructor as typeof ReviewModel;
    if (this._reviewDoc) reviewModel.calcAverageRatings(this._reviewDoc.tour);
  }
);

export const ReviewModel = model('Review', reviewSchema);
