import { Response, NextFunction } from "express";
import { ResponseBuilder } from "./ResponseHelper";
import { checkJwt, ResponseMessageEnum ,CustomRequest} from "../Utils";
import { UserTokenDecrypted } from "../Types";



export const verifyUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  let errorResponse: ResponseBuilder<unknown>;
  try {
    if (!req.headers.authorization) {
      errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 401, ResponseMessageEnum.UNAUTHORIZED);
      return res.status(401).json(errorResponse.toJson());
    }
    const token = checkJwt(
      req.headers.authorization?.split(" ")[1]
    ) as UserTokenDecrypted;
    if (!token) {
      errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 401, ResponseMessageEnum.UNAUTHORIZED);
      return res.status(401).json(errorResponse.toJson());
    }
    req.user = token;
    next();
  } catch (err) {
    errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 400, err);
    return res.status(400).json(errorResponse.toJson());
  }
};