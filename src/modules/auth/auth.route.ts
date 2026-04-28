import { Router } from "express";
import { getBusinessTypes, login, signup } from "./auth.controller";

const authRouter = Router();

authRouter.get("/business-types", getBusinessTypes);
authRouter.post("/signup", signup);
authRouter.post("/login", login);

export default authRouter;
