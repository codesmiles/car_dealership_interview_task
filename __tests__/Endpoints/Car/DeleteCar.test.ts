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

const endpoint = (param:string | unknown) => (`${ROUTES.apiV1}${ROUTES.car}/${param}`);

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


const userService = new UserService();
const carService = new CarService();

describe(`PUT ${endpoint(":id")}`, () => {
    let carId: ICar["_id"],
        employeeId: IUser["_id"],
        customerId: IUser["_id"];
    // database connection
    beforeAll(async () => {
        await prepare_database()
        employeePayload.password = await generateHash(password);
        customerPayload.password = await generateHash(password);
        const [employee, customer, car] = await Promise.all([
            await userService.create(employeePayload),
            await userService.create(customerPayload),
            await carService.create(createCarPayload),

        ]);
        carId = car._id;
        employeeId = employee._id;
        customerId = customer._id;
    }, 20000);;

    afterAll(async () => {
        await cleanup_database()
        await mongoose.disconnect();
    }, 10000);


    it('should return an unauthorized user message if youre not authenticated', async () => {
        const response = await request(app).delete(endpoint(":carId")).send();

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', ResponseBuilder.ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 401);
        expect(typeof response.body.data).toBe('string');
        expect(response.body).toHaveProperty('data', ResponseMessageEnum.UNAUTHORIZED);

    });


    it('should return forbidden endpoint for authenticated customer', async () => {

        const token = signJwt({
            id: customerId,
            role: customerPayload.role,
            email: customerPayload.email,
        });

        const response = await request(app).delete(endpoint(carId)).set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
        expect(typeof response.body.data).toBe('string');
        expect(response.body).toHaveProperty('message', ResponseBuilder.ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 403);
        expect(response.body).toHaveProperty('data', ResponseMessageEnum.FORBIDDEN);
    });

      it('should return a success message', async () => {

        const token = signJwt({
            id: employeeId,
            role: employeePayload.role,
            email: employeePayload.email,
        });

        const response = await request(app).delete(endpoint(carId)).set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', ResponseBuilder.SUCCESS_MESSAGE);
        expect(response.body).toHaveProperty('status', 200);
        expect(typeof response.body.data).toBe('object');
        expect(response.body).toHaveProperty('data');
    });

})