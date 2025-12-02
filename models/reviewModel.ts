import { model, Schema, type InferSchemaType } from 'mongoose';

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
    default: Date.now(),
  },
  tour: { type: Schema.Types.ObjectId, ref: 'Tour' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

reviewSchema.pre(['find', 'findOne'], async function (next) {
  this.populate({ path: 'user', select: '-__v -passwordChangedAt -photo' });
  next();
});

export type Review = InferSchemaType<typeof reviewSchema>;
export const ReviewModel = model('Review', reviewSchema);
