import type { NextFunction, Request, Response } from "express";
import { ApiError, asyncHandler } from "./error.middleware";
import * as authService from "../modules/auth/auth.service";

const extractBearerToken = (authorizationHeader: string | undefined): string => {
  if (!authorizationHeader) {
    throw new ApiError(401, "Authentication is required.");
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Authentication token is invalid.");
  }

  return token;
};

export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token = extractBearerToken(req.headers.authorization);
    const payload = authService.verifyAuthToken(token);
    const user = await authService.getCurrentUser(payload.userId);

    if (!user) {
      throw new ApiError(401, "Authentication token is invalid.");
    }

    req.authUser = user;
    next();
  },
);
