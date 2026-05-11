import { type Request, type Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware";
import { sendSuccess } from "../../utils/http";
import * as usersService from "./users.service";

const getUserId = (req: Request): string =>
  Array.isArray(req.params.userId)
    ? (req.params.userId[0] ?? "")
    : (req.params.userId ?? "");

export const getUsersDashboardData = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Users dashboard data fetched successfully.",
      await usersService.getUsersDashboardData(),
    );
  },
);

export const createUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      201,
      "User created successfully.",
      await usersService.createUser(req.body),
    );
  },
);

export const updateUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "User updated successfully.",
      await usersService.updateUser(getUserId(req), req.body),
    );
  },
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await usersService.deleteUser(getUserId(req));
    sendSuccess(res, 200, "User deleted successfully.", { deleted: true });
  },
);
