import Joi from "joi";


export const createCarSchema = Joi.object({
    vin: Joi.string().required(),
    brand: Joi.string().required(),
    color: Joi.string(),
    price: Joi.number().required(),
    soldTo: Joi.string(),
    isActive: Joi.boolean().required(),
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
    vin: Joi.string(),
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
    price: Joi.number(),
    soldTo: Joi.string(),
    isActive: Joi.boolean(),
    category: Joi.string(),
    carModel: Joi.string(),
    mileage: Joi.number(),
    features: Joi.array().items(Joi.string()),
    quantityAvailable: Joi.number(),
});