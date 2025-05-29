import mongoose, { Schema, Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    role: string; // e.g. "customer", employer
    purchasedCars: Schema.Types.ObjectId[]; // Array of Car references
}

const customerSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
}, {
    timestamps: true
});
export const Customer = mongoose.model<IUser>("Customer", customerSchema);