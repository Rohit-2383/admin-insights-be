import type { AuthUser } from "../modules/auth/auth.service";

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export {};
