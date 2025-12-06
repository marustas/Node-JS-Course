import { ObjectId } from 'mongodb';
import { model, Schema, type InferSchemaType } from 'mongoose';

const tourSchema = new Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour name must have less or equal than 40 characters'],
    minlength: [10, 'A tour name must have more or equal than 10 characters'],
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: { values: ['easy', 'medium', 'difficult'], message: 'Invalid difficulty' },
  },
  ratingAverage: {
    type: Number,
    default: 0,
    min: [1, 'A tour rating must be above 1.0'],
    max: [5, 'A tour rating must be below 5.0'],
    set: (val: number) => Math.round(val * 10) / 10,
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: {
    type: Number,
    validate: {
      // only works for new document creation, because "this" points to current document in creation
      validator: function (value: number) {
        return value < this.price;
      },
      message: 'Discount price ({VALUE}) should be below regular price',
    },
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have an image cover'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
  secretTour: Boolean,
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },
  ],

  guides: [{ type: ObjectId, ref: 'User' }],
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

tourSchema.pre(['find', 'findOne', 'findOneAndUpdate'], async function (next) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });

  next();
});

export type Tour = InferSchemaType<typeof tourSchema>;

const TourModel = model('Tour', tourSchema);

export default TourModel;
