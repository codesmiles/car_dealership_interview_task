import { UserRoles } from '../Utils';
import mongoose, { Schema, Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRoles;
    soldCars: Schema.Types.ObjectId[]; 
    purchasedCars: Schema.Types.ObjectId[];
}

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: Object.values(UserRoles),
    required: true,
    default: UserRoles.CUSTOMER,
  },
  purchasedCars: [{ type: Schema.Types.ObjectId, ref: 'Car' }],
  soldCars: [{ type: Schema.Types.ObjectId, ref: 'Car' }],
}, {
    timestamps: true
});
export const User = mongoose.model<IUser>("User", userSchema);