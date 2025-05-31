import { UserRoles } from '../Utils';
import mongoose, { Schema, Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRoles;
    isDeleted: boolean; 
    DeletedAt?: Date;
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
  isDeleted: { type: Boolean, default: false },
    DeletedAt: { type: Date, default: null }
}, {
    timestamps: true
});
export const User = mongoose.model<IUser>("User", userSchema);