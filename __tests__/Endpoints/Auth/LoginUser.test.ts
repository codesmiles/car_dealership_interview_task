// TEST THE VALIDATION OF THE LOGIN USER ENDPOINT
import request from 'supertest';
import { app, ROUTES, ResponseMessageEnum } from "../../../src";

const endpoint =`${ROUTES.apiV1}${ROUTES.auth}${ROUTES.loginUser}`;
describe(`POST ${endpoint}`, () => {
  it('should return no payload provided error message', async () => {
    
    const response = await request(app).post(endpoint);
    
    expect(response.status).toBe(400);
      expect(response.body).toEqual({
          message: ResponseMessageEnum.VALIDATION_ERROR_MESSAGE,
          status: 400,
          data: "No Payload was provided"
      });
  });
});


describe(`POST ${endpoint}`, () => {
  it('should return no payload provided error message', async () => {
    const response = await request(app).post(endpoint).send({});
  
    expect(response.status).toBe(400);
    expect(typeof response.body.data).toBe('object');
    expect(response.body).toHaveProperty('message', ResponseMessageEnum.VALIDATION_ERROR_MESSAGE);
    expect(response.body).toHaveProperty('status', 400);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toEqual(["\"email\" is required", "\"password\" is required"]);

  });{
      message: 'Validation Error',
      status: 400,
      data: [ '"email" is required' ]
    }
});