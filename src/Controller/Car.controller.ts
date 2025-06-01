import { ICar,ISale } from "../Models";
import { createCarSchema, getAllCarsSchema, updateCarSchema, purchaseCarSchema } from "../Dto"
import { CarService, UserService,SaleService } from "../Services";
import { Response } from "express";
import { validator, ResponseBuilder, ResponseMessageEnum, PaginatedResponse,CustomRequest } from "../Utils";
import mongoose, { FilterQuery } from "mongoose";





const userService = new UserService();
const saleService = new SaleService();


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
        const car = await carService.findSingle({ payload: { vin: req.body.vin } })
            ?? await carService.create(req.body);
        
        // // find or create car
        // const car = await carService.findOrCreate(req.body, "vin");
        successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 201, car);
        return res.status(201).json(successResponse.toJson());
    } catch (err) {
        console.log(err)
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

// purchase car
export const purchase_car = async (req: CustomRequest, res: Response) => {
    let successResponse: ResponseBuilder<ISale>;
    let errorResponse: ResponseBuilder<unknown>;

    const session = await mongoose.startSession();

    try {
        // validate requests
        const validate_req_payload = validator(purchaseCarSchema, await req.body);
        if (validate_req_payload) {
            return res.status(400).json(validate_req_payload);
        }

        session.startTransaction();

        req.body.seller = req.user.id;

        // check if user exists
        const buyer = await userService.findSingle({ payload: { _id: req.body.buyer } }, session);
        if (!buyer || buyer === null) {
            await session.abortTransaction();
            errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 400, ResponseMessageEnum.USER_NOT_FOUND);
            return res.status(400).json(errorResponse.toJson());
        }

        // check if car exists and if it is available for purchase and if it is not already sold out
        const car = await carService.findSingle({ payload: { _id: req.body.car } }, session);
        if (!car || car === null) {
            await session.abortTransaction();
            errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 400, ResponseMessageEnum.CAR_NOT_FOUND);
            return res.status(400).json(errorResponse.toJson());
        }
        
        if (!car.isActive || car.quantityAvailable <= 0) {
            await session.abortTransaction();
            errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 400, ResponseMessageEnum.CAR_ALREADY_SOLD);
            return res.status(400).json(errorResponse.toJson());
        }

        // create sale record
        const sale = await saleService.create(await req.body, session,["buyer", "car", "seller"]);
        if (!sale || sale === null) {
            await session.abortTransaction();
            errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 400, ResponseMessageEnum.SALE_NOT_CREATED);
            return res.status(400).json(errorResponse.toJson());
        }

        //   update car's quantity available
        const update_car_quantity = await carService.update({ _id: car._id }, { quantityAvailable: car.quantityAvailable - req.body.count }, session);
        if (!update_car_quantity || update_car_quantity === null) {
            await session.abortTransaction();
            errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 400, ResponseMessageEnum.CAR_QUANTITY_NOT_UPDATED);
            return res.status(400).json(errorResponse.toJson());
        }

        await session.commitTransaction();
        successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 200, sale);
        return res.status(200).json(successResponse.toJson());
    } catch (err) {

        await session.abortTransaction();
        console.error(err);
        errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 500, err);
        return res.status(500).json(errorResponse.toJson());
    }
    finally {
        // End session
        session.endSession();
    }
};
