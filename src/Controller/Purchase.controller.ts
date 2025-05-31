import { ISale } from "../Models";
import { purchaseCarSchema } from "../Dto"
import { CarService, UserService,SaleService } from "../Services";
import { Response } from "express";
import { validator, ResponseMessageEnum, ResponseBuilder, CustomRequest } from "../Utils";
import mongoose from "mongoose";


const carService = new CarService();
const userService = new UserService();
const saleService = new SaleService();

// purchase a car: 
// record the car model decrese the quantity, record the user model, record the sales model,
export const purchase = async (req: CustomRequest, res: Response) => {
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
        const buyer = await userService.findSingle({ payload: { email: req.body.buyer } }, session);
        if (!buyer || buyer === null) {
            await session.abortTransaction();
            errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 400, ResponseMessageEnum.USER_NOT_FOUND);
            return res.status(400).json(errorResponse.toJson());
        }
        // check if car exists and if it is available for purchase and if it is not already sold out
        const car = await carService.findSingle({ payload: { vin: req.body.car } }, session);
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


// view customer purchase history
