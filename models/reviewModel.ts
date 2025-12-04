import { model, Schema, Types, type InferSchemaType, type PipelineStage } from 'mongoose';
import TourModel from './tourModel.ts';

interface AverageRatingsResult {
  _id: Types.ObjectId;
  averageRating: number;
  ratingQuantity: number;
}

const reviewSchema = new Schema({
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
    default: Date.now,
  },
  tour: { type: Schema.Types.ObjectId, ref: 'Tour' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

reviewSchema.statics.calcAverageRatings = async function (tourId: Types.ObjectId) {
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
};

reviewSchema.pre(['find', 'findOne'], async function (next) {
  this.populate({ path: 'user', select: '-__v -passwordChangedAt -photo' });
  next();
});

export type Review = InferSchemaType<typeof reviewSchema>;
export const ReviewModel = model('Review', reviewSchema);
