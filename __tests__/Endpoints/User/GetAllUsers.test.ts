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
    UserService,
    signJwt,
} from "../../../src";
import { cleanup_database, prepare_database } from "../../helperFunction";


const endpoint = `${ROUTES.apiV1}${ROUTES.user}/`;
const userService = new UserService();

describe(`POST ${endpoint}`, () => {
    // database connection
    beforeAll(async () => {
   await prepare_database()
        console.log('Connected to MongoDB for testing');
    }, 10000);

    beforeEach(async () => {
        await Promise.all([userService.deleteMany({})]);
    }, 10000);
    
    afterAll(async () => {
        await cleanup_database()
        await mongoose.disconnect();
    }, 10000);


    it('should return an unauthorized user message if youre not authenticated', async () => {
        const response = await request(app).get(endpoint).send();

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', ResponseBuilder.ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 401);
        expect(typeof response.body.data).toBe('string');
        expect(response.body).toHaveProperty('data', ResponseMessageEnum.UNAUTHORIZED);

    });

    it('should return a successful response message', async () => {
           
        const password = 'password123';
        const payload = { email: 'test@example.com', password: await generateHash(password), name: 'Test User', phone: '1234567890', role: UserRoles.EMPLOYEE }
        const user = await userService.create(payload);

   const token = signJwt({
      id: user._id,
      role: payload.role,
      email: payload.email,
    });
        const response = await request(app).get(endpoint).set('Authorization', `Bearer ${token}`).send();
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', ResponseBuilder.SUCCESS_MESSAGE);
        expect(response.body).toHaveProperty('status', 200);
        expect(response.body).toHaveProperty('data');
        expect(typeof response.body.data).toBe('object');
        expect(response.body.data).toHaveProperty("payload");
        expect(typeof response.body.data.payload).toBe('object');
        expect(typeof response.body.data.meta).toBe('object');
        expect(response.body.data).toHaveProperty('meta', { page: 1, total: 1, pageSize: 5, totalPages: 1 });

    });
})