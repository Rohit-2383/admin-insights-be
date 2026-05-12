import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getOrdersDashboardData,
  updateOrder,
} from "./orders.controller";

const ordersRouter = Router();

ordersRouter.get("/", getOrdersDashboardData);
ordersRouter.post("/", createOrder);
ordersRouter.patch("/:orderId", updateOrder);
ordersRouter.delete("/:orderId", deleteOrder);

export default ordersRouter;
