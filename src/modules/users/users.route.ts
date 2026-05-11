import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUsersDashboardData,
  updateUser,
} from "./users.controller";

const usersRouter = Router();

usersRouter.get("/", getUsersDashboardData);
usersRouter.post("/", createUser);
usersRouter.patch("/:userId", updateUser);
usersRouter.delete("/:userId", deleteUser);

export default usersRouter;
