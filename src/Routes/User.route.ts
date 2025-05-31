import { Application, Router } from "express";
import { ROUTES, verifyUser } from "../Utils";
import { findSingleUser, getAllUsers, updateUser, viewCustomerPurchases } from "../Controller";

const routes = Router();
routes.use(verifyUser as Application);


routes.get("/", getAllUsers as Application);
routes.put("/:id", updateUser as Application); 
routes.get("/:id", findSingleUser as Application); 
routes.get(`/:id/${ROUTES.view_user_purchases}`, viewCustomerPurchases as Application); 


export default routes;