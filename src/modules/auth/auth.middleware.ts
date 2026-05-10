import { type Request, type Response, type NextFunction } from "express";
import { ApiError } from "../../middlewares/error.middleware";
import { findAuthUserById, verifyToken } from "./auth.service";

const extractBearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  return header.slice(7).trim() || null;
};

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new ApiError(401, "Authentication required.");
    }
    const payload = verifyToken(token);
    const user = await findAuthUserById(payload.sub);
    if (!user) {
      throw new ApiError(401, "Authenticated user no longer exists.");
    }
    req.authUser = user;
    next();
  } catch (error) {
    next(error);
  }
};
