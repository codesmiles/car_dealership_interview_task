import mongoose, { Schema, Document } from 'mongoose';

export interface ICar extends Document {
    vin: string; 
    brand: string;
    price: number;
    color?: string; // e.g. 'Red', 'Blue'
    soldTo?: Schema.Types.ObjectId; // Reference to User (customer who bought it)
    isActive: boolean;
    category: string; // e.g. 'SUV', 'Sedan'
    carModel: string; // Conflicts with Document.model
    features?: string[]; // e.g., ["sunroof", "Bluetooth", "backup camera"]
    mileage?: number; // Optional for used cars
    createdBy: Schema.Types.ObjectId; // Reference to User (employee who added it)
    quantityAvailable: number; // e.g. 3 units of the same model available
    isDeleted: boolean; 
    DeletedAt?: Date;
}

const carSchema = new Schema<ICar>({
    vin: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    color: { type: String },
    soldTo: { type: Schema.Types.ObjectId, ref: 'User' },
    mileage: { type: Number },
    carModel: { type: String, required: true },
    isActive: { type: Boolean, default: true }, // availablikity
    category: {
        type: String,
        ref: 'Category',
        required: true,
        enum: ['SUV', 'Sedan', 'Hatchback', 'Truck', 'Coupe', 'Convertible']
    },
    features: [String],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    quantityAvailable: { type: Number, default: 1, min: 0 },
    isDeleted: { type: Boolean, default: false },
    DeletedAt: { type: Date, default: null } 
}, {
    timestamps: true
});

carSchema.index({ vin: 1, brand: 1 }, { unique: true }); // Ensure unique combination of vin and brand
export const Car = mongoose.model<ICar>("Car", carSchema);
