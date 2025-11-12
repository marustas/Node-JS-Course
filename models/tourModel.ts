import mongoose, { Schema } from 'mongoose';

import type { InferSchemaType } from 'mongoose';

const tourSchema = new Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

export type Tour = InferSchemaType<typeof tourSchema>;

const TourModel = mongoose.model<Tour>('Tour', tourSchema);

export default TourModel;
