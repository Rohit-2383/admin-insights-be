import { type Request, type Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware";
import { sendSuccess } from "../../utils/http";
import * as usersService from "./users.service";

const parseUserId = (value: string | string[] | undefined): number =>
  Number.parseInt(
    Array.isArray(value) ? (value[0] ?? "") : (value ?? ""),
    10,
  );

export const getUsersDashboardData = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Users dashboard data fetched successfully.",
      usersService.getUsersDashboardData(),
    );
  },
);

export const updateUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "User updated successfully.",
      usersService.updateUser(parseUserId(req.params.userId), req.body),
    );
  },
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    usersService.deleteUser(parseUserId(req.params.userId));
    sendSuccess(res, 200, "User deleted successfully.", { deleted: true });
  },
);
