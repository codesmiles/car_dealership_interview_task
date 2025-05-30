import { Application, Router } from "express";
import { verifyUser, ROUTES } from "../Utils";
import { createCar,updateCar,getAllCars, deleteCar,findSingleCar } from "../Controller";

const routes = Router();
routes.use(verifyUser as Application);


routes.post("/", createCar as Application);
routes.get("/", getAllCars as Application);

routes.get("/:id", findSingleCar as Application);
routes.put("/:id", updateCar as Application);
routes.delete("/:id", deleteCar as Application);

export default routes;