import { UserRoles } from "../Utils";
import Joi from "joi";


export const createUserSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required().min(10).max(15),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid(...Object.values(UserRoles)).default(UserRoles.CUSTOMER),
});

export const loginSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
    name: Joi.string(),
    phone: Joi.string().min(10).max(15),
    password: Joi.string().min(8),
    role: Joi.string().valid(...Object.values(UserRoles)).default(UserRoles.CUSTOMER),
});

export const getAllUserSchema = Joi.object({
    page: Joi.number(),
    pageSize: Joi.number(),
    search: Joi.string(),
    name: Joi.string(),
    phone: Joi.string().min(10).max(15),
    email: Joi.string().email(),
    role: Joi.string().valid(...Object.values(UserRoles)).default(UserRoles.CUSTOMER),
});
export const getAllUserPurchaseSchema = Joi.object({
    page: Joi.number(),
    pageSize: Joi.number(),
    search: Joi.string(),
});