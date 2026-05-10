import { Router } from "express";
import { login, me, register } from "./auth.controller";
import { requireAuth } from "./auth.middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", requireAuth, me);

export default authRouter;
