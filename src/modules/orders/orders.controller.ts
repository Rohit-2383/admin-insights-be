import { type Request, type Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware";
import { sendSuccess } from "../../utils/http";
import * as ordersService from "./orders.service";

export const getOrdersDashboardData = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Orders dashboard data fetched successfully.",
      ordersService.getOrdersDashboardData(),
    );
  },
);
