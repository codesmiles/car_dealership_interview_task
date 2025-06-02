import dotenv from "dotenv";
dotenv.config();

import request from 'supertest';
import mongoose from 'mongoose';
import {
    app,
    ICar,
    IUser,
    ROUTES,
    signJwt,
    UserRoles,
    CarService,
    UserService,
    generateHash,
    ResponseBuilder,
    ResponseMessageEnum,
} from "../../../src";
import { cleanup_database, prepare_database } from "../../helperFunction";

const endpoint = `${ROUTES.apiV1}${ROUTES.car}${ROUTES.purchase}`;

const password = 'password123';
const employeePayload = { email: 'employee@example.com', password, name: 'Test User', phone: '1234567890', role: UserRoles.EMPLOYEE }
const customerPayload = { email: 'customer@example.com', password, name: 'Test User', phone: '1234567890', role: UserRoles.CUSTOMER }
const createCarPayload = {
    vin: 123454,
    brand: "toyota",
    price: 2343,
    category: "SUV",
    carModel: "vibes",
    quantityAvailable: 23
}
const createSoldOutCarPayload = {
    vin: 12345467,
    brand: "benz",
    price: 2343,
    category: "jeep",
    isActive: false,
    carModel: "vibes",
    quantityAvailable: 0,
}


const userService = new UserService();
const carService = new CarService();
describe(`POST ${endpoint}`, () => {
    let carId: ICar["_id"],
        employeeId: IUser["_id"],
        customerId: IUser["_id"],
        soldOutCarId: ICar["_id"];
    // database connection
    beforeAll(async () => {
        await prepare_database()
        employeePayload.password = await generateHash(password);
        customerPayload.password = await generateHash(password);
        const [employee, customer, car, soldOutCar] = await Promise.all([
            await userService.create(employeePayload),
            await userService.create(customerPayload),
            await carService.create(createCarPayload),
            await carService.create(createSoldOutCarPayload)
        ]);
        carId = car._id;
        employeeId = employee._id;
        customerId = customer._id;
        soldOutCarId = soldOutCar._id;
    }, 20000);;

    afterAll(async () => {
        await cleanup_database()
        await mongoose.disconnect();
    }, 10000);

    it('should return an unauthorized user message if youre not authenticated', async () => {
        const response = await request(app).post(endpoint).send();

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', ResponseBuilder.ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 401);
        expect(typeof response.body.data).toBe('string');
        expect(response.body).toHaveProperty('data', ResponseMessageEnum.UNAUTHORIZED);

    });

    it('should return no payload provided error message', async () => {
        const token = signJwt({
            id: employeeId,
            role: employeePayload.role,
            email: employeePayload.email,
        });

        const response = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send();

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: ResponseMessageEnum.VALIDATION_ERROR_MESSAGE,
            status: 400,
            data: "No Payload was provided"
        });
    });

    it('should return forbidden endpoint for authenticated customer', async () => {

        const token = signJwt({
            id: customerId,
            role: customerPayload.role,
            email: customerPayload.email,
        });

        const response = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send({});

        expect(response.status).toBe(403);
        expect(typeof response.body.data).toBe('string');
        expect(response.body).toHaveProperty('message', ResponseBuilder.ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 403);
        expect(response.body).toHaveProperty('data', ResponseMessageEnum.FORBIDDEN);
    });

    it('should return missing fields validation error message', async () => {
        const token = signJwt({
            id: employeeId,
            role: employeePayload.role,
            email: employeePayload.email,
        });

        const response = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send({});

        expect(response.status).toBe(400);
        expect(typeof response.body.data).toBe('object');
        expect(response.body).toHaveProperty('message', ResponseMessageEnum.VALIDATION_ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 400);
        expect(response.body).toHaveProperty('data', [
            '"car" is required',
            '"buyer" is required',
            '"count" is required'
        ]);
    });
    it('should return user not found message', async () => {
        //  login employee
        const token = signJwt({
            id: employeeId,
            role: employeePayload.role,
            email: employeePayload.email,
        });
        const responsePayload = {
            car: "benz",
            buyer: "683a4d7a4dc5d86982323bd8",
            count: 3
        }

        const response = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(responsePayload);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', ResponseBuilder.ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 404);
        expect(typeof response.body.data).toBe('string');
        expect(response.body).toHaveProperty('data', ResponseMessageEnum.USER_NOT_FOUND);
    });

    it('should return car not found message', async () => {

        const token = signJwt({
            id: employeeId,
            role: employeePayload.role,
            email: employeePayload.email,
        });
        const responsePayload = {
            car: "683a4d7a4dc5d86982323bd8",
            buyer: customerId,
            count: 3
        }

        const response = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(responsePayload);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', ResponseBuilder.ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 404);
        expect(typeof response.body.data).toBe('string');
        expect(response.body).toHaveProperty('data', ResponseMessageEnum.CAR_NOT_FOUND);
    });

    it('should return car has been sold out message', async () => {

        const token = signJwt({
            id: employeeId,
            role: employeePayload.role,
            email: employeePayload.email,
        });
        const responsePayload = {
            car: soldOutCarId,
            buyer: customerId,
            count: 3
        }
        console.log(responsePayload);

        const response = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(responsePayload);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', ResponseBuilder.ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 400);
        expect(typeof response.body.data).toBe('string');
        expect(response.body).toHaveProperty('data', ResponseMessageEnum.CAR_ALREADY_SOLD);
    });

    it('should return a success message', async () => {

        const token = signJwt({
            id: employeeId,
            role: employeePayload.role,
            email: employeePayload.email,
        });
        const responsePayload = {
            car: carId,
            buyer: customerId,
            count: 3
        }

        const response = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(responsePayload);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', ResponseBuilder.SUCCESS_MESSAGE);
        expect(response.body).toHaveProperty('status', 200);
        expect(typeof response.body.data).toBe('object');
        expect(response.body).toHaveProperty('data');
    });


})