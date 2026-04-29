import { Router } from "express";
import { getAnalyticsDashboardData } from "./analytics.controller";

const analyticsRouter = Router();

analyticsRouter.get("/", getAnalyticsDashboardData);

export default analyticsRouter;
