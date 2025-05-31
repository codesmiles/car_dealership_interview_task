import { ROUTES } from "../Utils";
import carRoute from "./Car.route";
import authRoute from "./Auth.route";
import userRoute from "./User.route";
import { Router } from "express";

const router = Router();

router.use(ROUTES.car, carRoute);
router.use(ROUTES.auth, authRoute);
router.use(ROUTES.user, userRoute);


export default router;