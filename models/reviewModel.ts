import { model, Schema, type InferSchemaType } from 'mongoose';
import { ObjectId } from 'mongodb';

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
  tours: [{ type: ObjectId, ref: 'Tour' }],
  users: [{ type: ObjectId, ref: 'User' }],
});

reviewSchema.pre(['find', 'findOne'], async function (next) {
  this.populate({ path: 'users tours', select: '-__v -passwordChangedAt' });
  next();
});

export type Review = InferSchemaType<typeof reviewSchema>;
export const ReviewModel = model('Review', reviewSchema);
