import { ROUTES } from "../Utils";
import authRoute from "./Auth.route";
// import customerRoute from "./Customer.route";
import carRoute from "./Car.route";
import { Router } from "express";

const router = Router();

router.use(ROUTES.auth, authRoute);
// router.use(ROUTES.customer, customerRoute);
router.use(ROUTES.car, carRoute);


export default router;