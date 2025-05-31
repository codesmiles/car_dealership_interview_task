import Joi from "joi";


export const createCarSchema = Joi.object({
    vin: Joi.number().required(),
    brand: Joi.string().required(),
    color: Joi.string(),
    price: Joi.number().required(),
    soldTo: Joi.string(),
    isActive: Joi.boolean(),
    category: Joi.string().required(),
    carModel: Joi.string().required(),
    mileage: Joi.number(),
    features:  Joi.array().items(Joi.string()),
    quantityAvailable: Joi.number().required(),
});

export const getAllCarsSchema = Joi.object({
    page: Joi.number(),
    pageSize: Joi.number(),
    search: Joi.string(),
    vin: Joi.number(),
    brand: Joi.string(),
    color: Joi.string(),
    price: Joi.number(),
    soldTo: Joi.string(),
    isActive: Joi.boolean(),
    category: Joi.string(),
    carModel: Joi.string(),
    mileage: Joi.number(),
    features:  Joi.array().items(Joi.string()),
    createdBy:  Joi.string(),
    quantityAvailable: Joi.number(),
})

export const updateCarSchema = Joi.object({
    vin: Joi.number(),
    price: Joi.number(),
    soldTo: Joi.string(),
    isActive: Joi.boolean(),
    category: Joi.string(),
    carModel: Joi.string(),
    mileage: Joi.number(),
    features: Joi.array().items(Joi.string()),
    quantityAvailable: Joi.number(),
});

export const purchaseCarSchema = Joi.object({
    car: Joi.string().required(),
    buyer: Joi.string().required(),
    count: Joi.number().integer().min(1).required(),
    saleDate: Joi.date().iso(),
    salePrice: Joi.number(),
})

export const getAllPuechaseSchema = Joi.object({
    car: Joi.string(),
    buyer: Joi.string(),
    count: Joi.number().integer().min(1),
    saleDate: Joi.date().iso(),
    salePrice: Joi.number(),
})