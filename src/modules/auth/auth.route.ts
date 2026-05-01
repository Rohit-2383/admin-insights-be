import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { getBusinessTypes, login, me, signup } from "./auth.controller";

const authRouter = Router();

authRouter.get("/business-types", getBusinessTypes);
authRouter.get("/me", requireAuth, me);
authRouter.post("/signup", signup);
authRouter.post("/login", login);

export default authRouter;
