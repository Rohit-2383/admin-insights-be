import { type Request, type Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware";
import { sendSuccess } from "../../utils/http";
import * as ordersService from "./orders.service";

const getOrderId = (req: Request): string =>
  Array.isArray(req.params.orderId)
    ? (req.params.orderId[0] ?? "")
    : (req.params.orderId ?? "");

export const getOrdersDashboardData = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Orders dashboard data fetched successfully.",
      await ordersService.getOrdersDashboardData(),
    );
  },
);

export const createOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      201,
      "Order created successfully.",
      await ordersService.createOrder(req.body),
    );
  },
);

export const updateOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Order updated successfully.",
      await ordersService.updateOrder(getOrderId(req), req.body),
    );
  },
);

export const deleteOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await ordersService.deleteOrder(getOrderId(req));
    sendSuccess(res, 200, "Order deleted successfully.", { deleted: true });
  },
);
