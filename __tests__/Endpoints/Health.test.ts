// TEST THE HEALTH OF THE API ENDPOINT

// __tests__/user.test.ts
import request from 'supertest';
import { app, ROUTES } from "../../src";


describe(`GET /health`, () => {
    it('should return the health of the endpoint', async () => {
        const response = await request(app).get(ROUTES.health);
    
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "Operation succeeded",
            status: 200,
            data: 'API is working very fine fire on!!!'
        });
  });
});