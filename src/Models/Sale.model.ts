import mongoose, { Schema, Document } from 'mongoose';
import { ICar } from './Car.model';
import { IUser } from './User.model';

export interface ISale extends Document {
    car: Schema.Types.ObjectId | string | ICar; // Reference to Car
    buyer: Schema.Types.ObjectId | string | IUser; // Reference to Customer
    seller: Schema.Types.ObjectId | string | IUser; // Reference to User (employer)
    count: number; // Number of cars sold in this sale
    saleDate: Date;
    salePrice: number;
    isDeleted: boolean; 
    DeletedAt?: Date;
}

const salesSchema: Schema = new Schema({
    car: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    count: { type: Number, default: 1, min: 1 },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    saleDate: { type: Date, default: Date.now },
    salePrice: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
    DeletedAt: { type: Date, default: null }

}, {
    timestamps: true
});

export const Sale = mongoose.model<ISale>("Sale", salesSchema);