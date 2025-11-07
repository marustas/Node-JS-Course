import { Schema, model } from "mongoose";
import type { InferSchemaType } from "mongoose";

const tourSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  rating: { type: Number, default: 0 },
  price: { type: Number, required: true },
});

type Tour = InferSchemaType<typeof tourSchema>;

const TourModel = model<Tour>('Tour', tourSchema);

export default TourModel;