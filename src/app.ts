import express, { Express, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";

import { ROUTES } from "./Utils";
import routes from "./Routes";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Routes config
app.use(ROUTES.apiV1, routes);

// Api Health Check
app.get(ROUTES.Health, (req: Request, res: Response) => {
  try {
    const message = "API is working very fine fire on!!!";
    // const successResponse = new SuccessResponse(message, 200, null);
    // res.status(200).json(successResponse.toJson());
  } catch (err) {
    // res
    //   .status(400)
    //   .json(new ErrorResponse("Api has Issues", 400, err).toJson());
  }
});

export { app };
