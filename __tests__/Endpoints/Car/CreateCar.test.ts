// TEST THE VALIDATION OF THE LOGIN USER ENDPOINT
import dotenv from "dotenv";
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import {
    app,

    ROUTES,
    ResponseBuilder,
    ResponseMessageEnum,
    generateHash,
    UserRoles,
    CarService,
    UserService,
    signJwt,
    IUser
} from "../../../src";
import { cleanup_database, prepare_database } from "../../helperFunction";

const endpoint = `${ROUTES.apiV1}${ROUTES.car}/`;
// const login_endpoint = `${ROUTES.apiV1}${ROUTES.auth}${ROUTES.loginUser}`;

const password = 'password123';
const payload = { email: 'employee@example.com', password, name: 'Test User', phone: '1234567890', role: UserRoles.EMPLOYEE }
const payload2 = { email: 'customer@example.com', password, name: 'Test User', phone: '1234567890', role: UserRoles.CUSTOMER }

const carService = new CarService();
const userService = new UserService();
describe(`POST ${endpoint}`, () => {

    let employeeId: IUser["_id"], customerId: IUser["_id"];
    // database connection
    beforeAll(async () => {
        await prepare_database();

        payload.password = await generateHash(password);
        payload2.password = await generateHash(password);
        const [employee, customer] = await Promise.all([
            await userService.create(payload),
            await userService.create(payload2)
        ]);
        employeeId = employee._id as IUser["_id"] 
        customerId = customer._id as IUser["_id"] 
    }, 10000);

    beforeEach(async () => {
        await carService.deleteMany({});
    }, 10000);

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
            role: payload.role,
            email: payload.email,
        });

        const response = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send();

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: ResponseMessageEnum.VALIDATION_ERROR_MESSAGE,
            status: 400,
            data: "No Payload was provided"
        });
    });

    it('should return missing forbidden endpoint for customer message for customer', async () => {
        const token = signJwt({
            id: customerId,
            role: payload2.role,
            email: payload2.email,
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
            role: payload.role,
            email: payload.email,
        });


        const response = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send({});

        expect(response.status).toBe(400);
        expect(typeof response.body.data).toBe('object');
        expect(response.body).toHaveProperty('message', ResponseMessageEnum.VALIDATION_ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 400);
        expect(response.body).toHaveProperty('data', [
            '"vin" is required',
            '"brand" is required',
            '"price" is required',
            '"category" is required',
            '"carModel" is required',
            '"quantityAvailable" is required'
        ]);
    });

    it('should return success message', async () => {

        const token = signJwt({
            id: employeeId,
            role: payload.role,
            email: payload.email,
        });

        const createCarPayload = {
            vin: 1232543224658,
            brand: "toyota",
            price: "122000",
            category: "SUV",
            carModel: "camry",
            quantityAvailable: "20"
        }
        const response = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(createCarPayload);

        expect(response.status).toBe(201);
        expect(typeof response.body.data).toBe('object');
        expect(response.body).toHaveProperty('message', ResponseBuilder.SUCCESS_MESSAGE);
        expect(response.body).toHaveProperty('status', 201);
        expect(response.body).toHaveProperty('data');
    });
})