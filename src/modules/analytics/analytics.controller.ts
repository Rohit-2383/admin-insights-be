import { type Request, type Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware";
import { sendSuccess } from "../../utils/http";
import * as analyticsService from "./analytics.service";

export const getAnalyticsDashboardData = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Analytics dashboard data fetched successfully.",
      analyticsService.getAnalyticsDashboardData(req.query.range),
    );
  },
);
