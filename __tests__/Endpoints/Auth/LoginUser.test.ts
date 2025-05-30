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
  generateHash
} from "../../../src";

const endpoint = `${ROUTES.apiV1}${ROUTES.auth}${ROUTES.loginUser}`;

describe(`POST ${endpoint}`, () => {
  // database connection
  beforeAll(async () => {
  await mongoose.connect(`${ process.env.MONGODB_URL as string}/car_dealership_test`);
    console.log('Connected to MongoDB for testing');
  },10000);

  beforeEach(async () => {
    await User.deleteMany({});
  },10000);

  afterAll(async () => {
    await mongoose.disconnect();
  },10000);

  it('should return no payload provided error message', async () => {
    const response = await request(app).post(endpoint);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: ResponseMessageEnum.VALIDATION_ERROR_MESSAGE,
      status: 400,
      data: "No Payload was provided"
    });
  });

  it('should return missing fields message', async () => {
    const response = await request(app).post(endpoint).send({});

    expect(response.status).toBe(400);
    expect(typeof response.body.data).toBe('object');
    expect(response.body).toHaveProperty('message', ResponseMessageEnum.VALIDATION_ERROR_MESSAGE);
    expect(response.body).toHaveProperty('status', 400);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toEqual(["\"email\" is required", "\"password\" is required"]);
  });

  it('should return incorrect login credentials message', async () => {
    const response = await request(app).post(endpoint).send({
      email: 'test@example.com', password: 'password123'
    });

    expect(response.status).toBe(400);
    expect(typeof response.body).toBe('object');
    expect(response.body).toHaveProperty('message', ResponseBuilder.ERROR_MESSAGE);
    expect(response.body).toHaveProperty('status', 400);
    expect(response.body).toHaveProperty('data');
    expect(typeof response.body.data).toBe('string');
    expect(response.body).toHaveProperty('data', ResponseMessageEnum.INVALID_LOGIN_CREDENTIALS);

  });

  it('should return successfully logged in message', async () => {
      const password = await generateHash('password123');
    await User.create({ email: 'test@example.com', password, name: 'Test User',phone: '1234567890' });
    
    const response = await request(app).post(endpoint).send({
      email: 'test@example.com', password: 'password123'
    });

    expect(response.status).toBe(200);
    expect(typeof response.body).toBe('object');
    expect(response.body).toHaveProperty('message', ResponseBuilder.SUCCESS_MESSAGE);
    expect(response.body).toHaveProperty('status', 200);
    expect(response.body).toHaveProperty('data');
    expect(typeof response.body.data).toBe('object');
    expect(response.body.data).toHaveProperty('token');

  });
});