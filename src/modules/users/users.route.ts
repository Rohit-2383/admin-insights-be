import { Router } from "express";
import {
  deleteUser,
  getUsersDashboardData,
  updateUser,
} from "./users.controller";

const usersRouter = Router();

usersRouter.get("/", getUsersDashboardData);
usersRouter.patch("/:userId", updateUser);
usersRouter.delete("/:userId", deleteUser);

export default usersRouter;
