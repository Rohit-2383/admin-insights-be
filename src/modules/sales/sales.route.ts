import { Router } from "express";
import { getSalesDashboardData } from "./sales.controller";

const salesRouter = Router();

salesRouter.get("/", getSalesDashboardData);

export default salesRouter;
