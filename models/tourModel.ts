import mongoose, { Schema } from "mongoose";

interface TourSchema {
name: string;
rating: number;
price: number;
}


const tourSchema = new Schema<TourSchema>({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
    },
    rating: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    }
})

const tourModel = mongoose.model('Tour', tourSchema);

export default tourModel;