import { type Request, type Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware";
import { sendSuccess } from "../../utils/http";
import * as overviewService from "./overview.service";

export const getOverviewPageData = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Overview dashboard data fetched successfully.",
      overviewService.getOverviewPageData(),
    );
  },
);
