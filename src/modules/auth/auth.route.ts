import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  getBusinessTypes,
  login,
  me,
  signup,
} from "./auth.controller";

const authRouter = Router();

authRouter.get("/business-types", getBusinessTypes);
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", requireAuth, me);

export default authRouter;
