import { Application, Router } from "express";
import { ROUTES } from "../Utils";
import { registerUser, loginUser } from "../Controller";

const routes = Router();

routes.post(ROUTES.createUser, registerUser as Application);
routes.post(ROUTES.loginUser, loginUser as Application);

export default routes;