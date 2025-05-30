import { ICar } from "../Models";
import { createCarSchema, getAllCarsSchema, updateCarSchema } from "../Dto"
import { CarService } from "../Services";
import { Response } from "express";
import { validator, ResponseBuilder, ResponseMessageEnum, PaginatedResponse,CustomRequest } from "../Utils";
import { FilterQuery } from "mongoose";

const carService = new CarService();
export const createCar = async (req: CustomRequest, res: Response) => {
    let successResponse: ResponseBuilder<ICar>;
    let errorResponse: ResponseBuilder<unknown>;
    try {
        // validate requests
        const validate_req_payload = validator(createCarSchema, req.body);
        if (validate_req_payload) {
            return res.status(400).json(validate_req_payload);
        }

        // set car createdBy
        req.body.createdBy = req.user.id;
        // create car
        const car = await carService.findOrCreate(req.body, "vin");
        successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 201, car);
        return res.status(201).json(successResponse.toJson());
    } catch (err) {
        errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 500, err);
        return res.status(500).json(errorResponse.toJson());
    }
}

// findSingleCar
export const findSingleCar = async (req: CustomRequest, res: Response) => {
    let successResponse: ResponseBuilder<ICar>;
    let errorResponse: ResponseBuilder<unknown>;
    try {
        // fetch car
        const car = await carService.findSingle({ payload: { _id: req.params.id, } });
        if (!car) {
            errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 404, ResponseMessageEnum.CAR_NOT_FOUND);
            return res.status(404).json(errorResponse.toJson());
        }
        successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 200, car);
        return res.status(200).json(successResponse.toJson());
    } catch (err) {
        errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 500, err);
        return res.status(500).json(errorResponse.toJson());
    }
}

// get all
export const getAllCars = async (req: CustomRequest, res: Response) => {
    let successResponse: ResponseBuilder<PaginatedResponse<ICar>>;
    let errorResponse: ResponseBuilder<unknown>;
    try {
        // request validation
        const validate_req_payload = validator(getAllCarsSchema, req.query);
        if (validate_req_payload) {
            return res.status(400).json(validate_req_payload);
        }

        // Create a new object without page, search, and pageSize
        const { page, search, pageSize } = req.query;
        const queries = req.query as FilterQuery<Partial<ICar>>;
        // fetch all cars

        const cars = await carService.getAll({
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
            queries,
            search: search as string
        });

        successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 200, cars);
        return res.status(200).json(successResponse.toJson());
    } catch (err) {
        errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 500, err);
        return res.status(500).json(errorResponse.toJson());
    }
}

// update
export const updateCar = async (req: CustomRequest, res: Response) => {
    let successResponse: ResponseBuilder<ICar>;
    let errorResponse: ResponseBuilder<unknown>;
    try {
        // validate requests
        const validate_req_payload = validator(updateCarSchema, req.body);
        if (validate_req_payload) {
            return res.status(400).json(validate_req_payload);
        }

        // update car
        const car = await carService.update({_id: req.params.id}, req.body);
        if (!car) {
            errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 404, ResponseMessageEnum.CAR_NOT_FOUND);
            return res.status(404).json(errorResponse.toJson());
        }
        successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 200, car);
        return res.status(200).json(successResponse.toJson());
    } catch (err) {
        errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 500, err);
        return res.status(500).json(errorResponse.toJson());
    }
}

// delete
export const deleteCar = async (req: CustomRequest, res: Response) => {
    let successResponse: ResponseBuilder<null>;
    let errorResponse: ResponseBuilder<unknown>;

  try {
    console.log("DELETE SCHOOL ENDPOINT");
    if (req.query.isPermanent === "true") {
      await carService.delete(req.params.id);
      successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 200, null);
      return res.status(200).json(successResponse.toJson());
    }

    await carService.softDelete(req.params.id);
    successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 200, null);
    return res.status(200).json(successResponse.toJson());
  } catch (error) {
    errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 500, error);
    return res.status(500).json(errorResponse.toJson());
  }
}