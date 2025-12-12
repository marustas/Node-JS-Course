import { model, Schema, Types, type InferSchemaType } from 'mongoose';

const bookingSchema = new Schema({
  tour: {
    type: Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour'],
  },
  user: {
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(['find', 'findOne'], async function (next) {
  this.populate({ path: 'user', select: 'name' });
  next();
});

export type Booking = InferSchemaType<typeof bookingSchema>;

export const BookingModel = model('Booking', bookingSchema);
