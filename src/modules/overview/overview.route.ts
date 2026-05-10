import { Router } from "express";
import { getOverviewPageData } from "./overview.controller";

const overviewRouter = Router();

overviewRouter.get("/", getOverviewPageData);

export default overviewRouter;
