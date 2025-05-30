import { IUser } from "../Models";
import { loginSchema, createUserSchema } from "../Dto"
import { LoginResponse } from "../Types";
import { AuthService } from "../Services";
import { Response, Request } from "express";
import { validator, signJwt, comparePassword, ResponseMessageEnum, ResponseBuilder } from "../Utils";

const authService = new AuthService();

export const registerUser = async (req: Request, res: Response) => { 
    let successResponse: ResponseBuilder<IUser>;
    let errorResponse: ResponseBuilder<unknown>;
    try {
        // validate requests
        const validate_req_payload = validator(createUserSchema, req.body);
        if (validate_req_payload) {
        return res.status(400).json(validate_req_payload);
        }
    
        // check if user already exists
        const existingUser = await authService.findSingle({ email: req.body.email });
        if (existingUser) {
        errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 400, ResponseMessageEnum.USER_ALREADY_EXISTS);
        return res.status(400).json(errorResponse.toJson());
        }
    
        // create user
        const user = await authService.create(req.body);
    
        successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 201, user);
        return res.status(201).json(successResponse.toJson());
    } catch (err) {
        errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 500, err);
        return res.status(500).json(errorResponse.toJson());
    }
}

export const loginUser = async (req: Request, res: Response) => {
  let successResponse: ResponseBuilder<LoginResponse>;
  let errorResponse: ResponseBuilder<unknown>;
    try {
    // validate requests
    const validate_req_payload = validator(loginSchema, await req.body);
        if (validate_req_payload) {
        console.error(validate_req_payload);
      return res.status(400).json(validate_req_payload);
    }

    // check if user exists
    let user = await authService.findSingle({ email: await req.body.email });
    if (!user || user === null) {
      errorResponse = new  ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 400, ResponseMessageEnum.INVALID_LOGIN_CREDENTIALS);
      return res.status(400).json(errorResponse.toJson());
    };
    user = user.toObject({ getters: true }) as IUser;

    
    // sign jwt token
    const token = signJwt({
      id: user?._id,
      role: user?.role,
      email: user?.email,
    });

    // compare hashs if password has been updated
    const checkPassword = await comparePassword(user.password,await req.body.password);
    if (!checkPassword) {
      errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 400, ResponseMessageEnum.INVALID_LOGIN_CREDENTIALS);
      return res.status(400).json(errorResponse.toJson());
    };

    successResponse = new ResponseBuilder(ResponseBuilder.SUCCESS_MESSAGE, 200, { role: user?.role, token });
    return res.status(200).json(successResponse.toJson());
    } catch (err) {
    console.error(err);
    errorResponse = new ResponseBuilder(ResponseBuilder.ERROR_MESSAGE, 500, err);
    return res.status(500).json(errorResponse.toJson());
  }
};