import Joi from 'joi';

export const purchaseCarSchema = Joi.object({
    car: Joi.string().required(),
    buyer: Joi.string().required(),
    count: Joi.number().integer().min(1).required(),
    saleDate: Joi.date().iso(),
    salePrice: Joi.number().required(),
})

export const getAllPuechaseSchema = Joi.object({
    car: Joi.string(),
    buyer: Joi.string(),
    count: Joi.number().integer().min(1),
    saleDate: Joi.date().iso(),
    salePrice: Joi.number(),
})