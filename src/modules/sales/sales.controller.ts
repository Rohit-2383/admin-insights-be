import { type Request, type Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware";
import { sendSuccess } from "../../utils/http";
import * as salesService from "./sales.service";

export const getSalesDashboardData = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Sales dashboard data fetched successfully.",
      salesService.getSalesDashboardData(req.query.range),
    );
  },
);
