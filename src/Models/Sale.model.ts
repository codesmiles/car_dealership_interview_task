import mongoose, { Schema, Document } from 'mongoose';
export interface ISale extends Document {
    customer: Schema.Types.ObjectId; // Reference to Customer
    car: Schema.Types.ObjectId; // Reference to Car
    saleDate: Date;
    salePrice: number;
    seller: Schema.Types.ObjectId; // Reference to User (employer)
}

const salesSchema: Schema = new Schema({
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    car: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
    saleDate: { type: Date, default: Date.now },
    salePrice: { type: Number, required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

export const Sale = mongoose.model<ISale>("Sale", salesSchema);