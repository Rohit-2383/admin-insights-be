import { type Request, type Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware";
import * as authService from "./auth.service";

export const getBusinessTypes = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: "Business types fetched successfully.",
      data: authService.getBusinessTypes(),
    });
  },
);

export const signup = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authResponse = await authService.signup(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: authResponse,
    });
  },
);

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authResponse = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: authResponse,
    });
  },
);
