import { Application, Router } from "express";
import { authorizeRoles, ROUTES, UserRoles, verifyUser } from "../Utils";
import { createCar,updateCar,getAllCars, deleteCar,findSingleCar, purchase_car } from "../Controller";

const routes = Router();
routes.use(verifyUser as Application);



routes.post("/", authorizeRoles(UserRoles.EMPLOYEE) as Application, createCar as Application);
routes.get("/", getAllCars as Application);
routes.post(ROUTES.purchase, authorizeRoles(UserRoles.EMPLOYEE) as Application, purchase_car as Application);

routes.get("/:id", findSingleCar as Application);
routes.put("/:id", authorizeRoles(UserRoles.EMPLOYEE) as Application, updateCar as Application);
routes.delete("/:id", authorizeRoles(UserRoles.EMPLOYEE) as Application, deleteCar as Application);

export default routes;