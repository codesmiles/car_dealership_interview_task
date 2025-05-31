import { IUser,ISale } from "../Models";
import { updateUserSchema,getAllUserSchema } from "../Dto"
import { SaleService, UserService } from "../Services";
import { Response } from "express";
import { validator, ResponseBuilder, ResponseMessageEnum, PaginatedResponse,CustomRequest } from "../Utils";
import { FilterQuery } from "mongoose";

const userService = new UserService();
const saleService = new SaleService();


// findSingleuser
export const findSingleUser = async (req: CustomRequest, res: Response) => {
    let successResponse: ResponseBuilder<IUser>;
    let errorResponse: ResponseBuilder<unknown>;
    try {
        // fetch user
        const user = await userService.findSingle({ payload: { _id: req.params.id, } });
        if (!user) {
            errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 404, ResponseMessageEnum.USER_NOT_FOUND);
            return res.status(404).json(errorResponse.toJson());
        }
        successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 200, user);
        return res.status(200).json(successResponse.toJson());
    } catch (err) {
        errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 500, err);
        return res.status(500).json(errorResponse.toJson());
    }
}
export const viewCustomerPurchases = async (req: CustomRequest, res: Response) => {
    let successResponse: ResponseBuilder<PaginatedResponse<ISale>>;
    let errorResponse: ResponseBuilder<unknown>;
    try {
              // request validation
        const validate_req_payload = validator(getAllUserSchema, req.query);
        if (validate_req_payload) {
            return res.status(400).json(validate_req_payload);
        }

        // Create a new object without page, search, and pageSize
        const { page, search, pageSize } = req.query;
        const queries = {buyer: req.params.id} as FilterQuery<Partial<IUser>>;
        
        req.query.buyer = req.params.id;
        const sale = await saleService.getAll({
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
            queries,
            search: search as string
        },{
            populate: ["car", "buyer", "seller"]
        });
        if (!sale) {
            errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 404, ResponseMessageEnum.USER_NOT_FOUND);
            return res.status(404).json(errorResponse.toJson());
        }
        successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 200, sale);
        return res.status(200).json(successResponse.toJson());
    } catch (err) {
        errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 500, err);
        return res.status(500).json(errorResponse.toJson());
    }
}

// get all
export const getAllUsers = async (req: CustomRequest, res: Response) => {
    let successResponse: ResponseBuilder<PaginatedResponse<IUser>>;
    let errorResponse: ResponseBuilder<unknown>;
    try {
        // request validation
        const validate_req_payload = validator(getAllUserSchema, req.query);
        if (validate_req_payload) {
            return res.status(400).json(validate_req_payload);
        }

        // Create a new object without page, search, and pageSize
        const { page, search, pageSize } = req.query;
        const queries = req.query as FilterQuery<Partial<IUser>>;
        // fetch all users

        const users = await userService.getAll({
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
            queries,
            search: search as string
        });

        successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 200, users);
        return res.status(200).json(successResponse.toJson());
    } catch (err) {
        errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 500, err);
        return res.status(500).json(errorResponse.toJson());
    }
}

// update
export const updateUser = async (req: CustomRequest, res: Response) => {
    let successResponse: ResponseBuilder<IUser>;
    let errorResponse: ResponseBuilder<unknown>;
    try {
        // validate requests
        const validate_req_payload = validator(updateUserSchema, req.body);
        if (validate_req_payload) {
            return res.status(400).json(validate_req_payload);
        }

        // update user
        const user = await userService.update({_id: req.params.id}, req.body);
        if (!user) {
            errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 404, ResponseMessageEnum.USER_NOT_FOUND);
            return res.status(404).json(errorResponse.toJson());
        }
        successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 200, user);
        return res.status(200).json(successResponse.toJson());
    } catch (err) {
        errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 500, err);
        return res.status(500).json(errorResponse.toJson());
    }
}

// delete
export const deleteUser = async (req: CustomRequest, res: Response) => {
    let successResponse: ResponseBuilder<null>;
    let errorResponse: ResponseBuilder<unknown>;

  try {
    console.log("DELETE SCHOOL ENDPOINT");
    if (req.query.isPermanent === "true") {
      await userService.delete(req.params.id);
      successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 200, null);
      return res.status(200).json(successResponse.toJson());
    }

    await userService.softDelete(req.params.id);
    successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 200, null);
    return res.status(200).json(successResponse.toJson());
  } catch (error) {
    errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 500, error);
    return res.status(500).json(errorResponse.toJson());
  }
}
