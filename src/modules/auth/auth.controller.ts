import { type Request, type Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware";
import { sendSuccess } from "../../utils/http";
import * as authService from "./auth.service";

export const getBusinessTypes = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Business types fetched successfully.",
      authService.getBusinessTypes(),
    );
  },
);

export const signup = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      201,
      "Account created successfully.",
      await authService.signup(req.body),
    );
  },
);

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Login successful.",
      await authService.login(req.body),
    );
  },
);

export const me = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, 200, "Authenticated user fetched.", req.authUser);
  },
);
