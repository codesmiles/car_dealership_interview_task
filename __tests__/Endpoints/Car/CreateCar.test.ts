// TEST THE VALIDATION OF THE LOGIN USER ENDPOINT
import dotenv from "dotenv";
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import {
    app,
    User,
    ROUTES,
    ResponseBuilder,
    ResponseMessageEnum,
    generateHash,
    UserRoles
} from "../../../src";

const endpoint = `${ROUTES.apiV1}${ROUTES.car}/`;
const login_endpoint = `${ROUTES.apiV1}${ROUTES.auth}${ROUTES.loginUser}`;


describe(`POST ${endpoint}`, () => {
    // database connection
    beforeAll(async () => {
        await mongoose.connect(`${process.env.MONGODB_URL as string}/car_dealership_test`);
        console.log('Connected to MongoDB for testing');
    }, 10000);

    beforeEach(async () => {
        await User.deleteMany({});
    }, 10000);

    afterAll(async () => {
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
        const password = 'password123';
        const payload = { email: 'test@example.com', password: await generateHash(password), name: 'Test User', phone: '1234567890', role: UserRoles.EMPLOYEE }
        await User.create(payload);

        const login = await request(app).post(login_endpoint).send({
            email: payload.email, password
        })
        const token = login.body.data.token;

        const response = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send();

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: ResponseMessageEnum.VALIDATION_ERROR_MESSAGE,
            status: 400,
            data: "No Payload was provided"
        });
    });

    it('should return missing fields validation error message', async () => {
        const password = 'password123';
        const payload = { email: 'test@example.com', password: await generateHash(password), name: 'Test User', phone: '1234567890', role: UserRoles.CUSTOMER }
        await User.create(payload);

        const login = await request(app).post(login_endpoint).send({
            email: payload.email, password
        })
        const token = login.body.data.token;

        const response = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send({});

        console.log(response.body)
        expect(response.status).toBe(403);
        expect(typeof response.body.data).toBe('string');
        expect(response.body).toHaveProperty('message', ResponseBuilder.ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 403);
        expect(response.body).toHaveProperty('data', ResponseMessageEnum.FORBIDDEN);
    });
    
    it('should return missing fields validation error message', async () => {
        const password = 'password123';
        const payload = { email: 'test@example.com', password: await generateHash(password), name: 'Test User', phone: '1234567890', role: UserRoles.EMPLOYEE }
        await User.create(payload);

        const login = await request(app).post(login_endpoint).send({
            email: payload.email, password
        })
        const token = login.body.data.token;

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
        const password = 'password123';
        const payload = { email: 'test@example.com', password: await generateHash(password), name: 'Test User', phone: '1234567890', role: UserRoles.EMPLOYEE }
        await User.create(payload);

        const login = await request(app).post(login_endpoint).send({
            email: payload.email, password
        })
        const token = login.body.data.token;

        const createCarPayload = {
            vin: 1234543,
            brand: "toyota",
            price: "2343",
            category: "SUV",
            carModel: "vibes",
            quantityAvailable: "23"
        }
        const response = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(createCarPayload);

        console.log(response.body)
        expect(response.status).toBe(201);
        expect(typeof response.body.data).toBe('object');
        expect(response.body).toHaveProperty('message', ResponseBuilder.SUCCESS_MESSAGE);
        expect(response.body).toHaveProperty('status', 201);
        expect(response.body).toHaveProperty('data');
    });
})