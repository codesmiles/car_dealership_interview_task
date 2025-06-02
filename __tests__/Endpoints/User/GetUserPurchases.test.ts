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
    SaleService,
    ISale,
} from "../../../src";
import { cleanup_database, prepare_database } from "../../helperFunction";

const getRoute = (userId: string): string => {
    return `${ROUTES.apiV1}${ROUTES.user}/${userId}/${ROUTES.view_user_purchases}`;
}

const login_endpoint = `${ROUTES.apiV1}${ROUTES.auth}${ROUTES.loginUser}`;
const carService = new CarService();
const saleService = new SaleService();
const userService = new UserService();

describe(`POST ${getRoute("1")}`, () => {
    // database connection
    beforeAll(async () => {
           await prepare_database()
        console.log('Connected to MongoDB for testing');
    }, 10000);

    beforeEach(async () => {
        await Promise.all([userService.deleteMany({}), carService.deleteMany({}), saleService.deleteMany({})]);
    }, 10000);

    afterAll(async () => {
        await cleanup_database();
        await mongoose.disconnect();
    }, 10000);


    it('should return an unauthorized user message if youre not authenticated', async () => {
        const response = await request(app).get(getRoute("2j1")).send();

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', ResponseBuilder.ERROR_MESSAGE);
        expect(response.body).toHaveProperty('status', 401);
        expect(typeof response.body.data).toBe('string');
        expect(response.body).toHaveProperty('data', ResponseMessageEnum.UNAUTHORIZED);

    });

    it('should return a successful response message', async () => {
        // create car   
        const createCarPayload = {
            vin: 123454,
            brand: "toyota",
            price: 2343,
            category: "SUV",
            carModel: "vibes",
            quantityAvailable: 23
        }

        //    create 2 users
        const password = 'password123';
        const hashedPassword = await generateHash(password);

        const payload = { email: 'employee@example.com', password: hashedPassword, name: 'Test User', phone: '1234567890', role: UserRoles.EMPLOYEE };
        const payload2 = { email: 'customer@example.com', password: hashedPassword, name: 'Test User', phone: '1234567890', role: UserRoles.CUSTOMER };

        // will look into the find many an create many here
        const employee = await userService.create(payload);
        const customer = await userService.create( payload2);
        const car = await carService.create(createCarPayload)

        // buy car
        const sales_payload = {
            car: car._id,
            buyer: customer._id,
            count: 3,
            seller: employee._id,
        }

        await saleService.create(sales_payload as Partial<ISale>);
        const login = await request(app).post(login_endpoint).send({ email: payload2.email, password });
        const token = login.body.data.token;

        // check endpoint
        const response = await request(app).get(getRoute(customer._id as string)).set('Authorization', `Bearer ${token}`);

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