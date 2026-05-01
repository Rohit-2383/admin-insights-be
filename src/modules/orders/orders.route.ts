import { Router } from "express";
import { getOrdersDashboardData } from "./orders.controller";

const ordersRouter = Router();

ordersRouter.get("/", getOrdersDashboardData);

export default ordersRouter;
