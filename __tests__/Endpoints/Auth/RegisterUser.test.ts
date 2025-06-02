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
    UserService
} from "../../../src";
import { cleanup_database, prepare_database } from "../../helperFunction";

const userService = new UserService();

const endpoint = `${ROUTES.apiV1}${ROUTES.auth}${ROUTES.createUser}`;

describe(`POST ${endpoint}`, () => {
    // database connection
    beforeAll(async () => {
      await prepare_database()
        console.log('Connected to MongoDB for testing');
    }, 10000);

    beforeEach(async () => {
        await userService.deleteMany({});
    }, 10000);
    
    afterAll(async () => {
        await cleanup_database()
        await mongoose.disconnect();
    }, 10000);

    it('should return no payload provided error message', async () => {
        const response = await request(app).post(endpoint);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: ResponseMessageEnum.VALIDATION_ERROR_MESSAGE,
            status: 400,
            data: "No Payload was provided"
        });
    });

    it('should return missing fields validation error message', async () => {
        const response = await request(app).post(endpoint).send({});

        expect(response.status).toBe(400);
        expect(typeof response.body.data).toBe('object');
        expect(response.body).toHaveProperty('message', ResponseMessageEnum.VALIDATION_ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 400);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toEqual(['"name" is required', '"email" is required', '"phone" is required', '"password" is required']);
    });

    it('should return existing user error message', async () => {
        const payload = {
            email: 'test@example.com',
            phone: '1234567890',
            password: await generateHash('password123'),
            name: 'Test User',
 
        }
        await userService.create(payload);

        const response = await request(app).post(endpoint).send(payload);

        expect(response.status).toBe(400);
        expect(typeof response.body.data).toBe('string');
        expect(response.body).toHaveProperty('message', ResponseBuilder.ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 400);
        expect(response.body).toHaveProperty('data', ResponseMessageEnum.USER_ALREADY_EXISTS);
    });

    it('should return existing user creation success message', async () => {
        const payload = {
            email: 'test@example.com',
            phone: '1234567890',
            password: await generateHash('password123'),
            name: 'Test User',
 
        }
        const response = await request(app).post(endpoint).send(payload);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message', ResponseBuilder.SUCCESS_MESSAGE);
        expect(response.body).toHaveProperty('status', 201);
        expect(typeof response.body.data).toBe('object');
    });


});