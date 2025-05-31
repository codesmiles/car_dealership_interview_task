import { Application, Router } from "express";
import { verifyUser } from "../Utils";
import { findSingleUser, getAllUsers, updateUser, viewCustomerPurchases } from "../Controller";

const routes = Router();
routes.use(verifyUser as Application);


routes.get("/", getAllUsers as Application);
routes.put("/:id", updateUser as Application); 
routes.get("/:id", findSingleUser as Application); 
routes.get("/:id/viewUserPurchases", viewCustomerPurchases as Application); 


export default routes;