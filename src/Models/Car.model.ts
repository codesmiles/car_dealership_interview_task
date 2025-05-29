import mongoose, { Schema, Document } from 'mongoose';

export interface ICar extends Document {
  brand: string;
  carModel: string; // Conflicts with Document.model
  price: number;
  isActive: boolean;
  quantityAvailable: number; // e.g. 3 units of the same model available
  category: string; // e.g. 'SUV', 'Sedan'
}

const carSchema = new Schema<ICar>({
    brand: { type: String, required: true },
    carModel: { type: String, required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true }, // availablikity
    quantityAvailable: { type: Number, default: 1, min: 0 },
    category: {
        type: String,
        ref: 'Category',
        required: true,
        enum: ['SUV', 'Sedan', 'Hatchback', 'Truck', 'Coupe', 'Convertible']
    }
}, {
    timestamps: true
});

export const Car = mongoose.model<ICar>("Car", carSchema);