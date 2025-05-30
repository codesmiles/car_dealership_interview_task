import { Application, Router } from "express";
import { verifyUser, ROUTES } from "../Utils";
import { registerUser, loginUser } from "../Controller";

const routes = Router();


routes.post(ROUTES.createUser, verifyUser as Application, registerUser as Application);
routes.post(ROUTES.loginUser, loginUser as Application);

export default routes;