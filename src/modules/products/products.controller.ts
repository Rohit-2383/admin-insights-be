import { type Request, type Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware";
import { sendSuccess } from "../../utils/http";
import * as productsService from "./products.service";

const getProductId = (req: Request): string =>
  Array.isArray(req.params.productId)
    ? (req.params.productId[0] ?? "")
    : (req.params.productId ?? "");

export const getProductsDashboardData = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Products dashboard data fetched successfully.",
      await productsService.getProductsDashboardData(),
    );
  },
);

export const createProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      201,
      "Product created successfully.",
      await productsService.createProduct(req.body),
    );
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Product updated successfully.",
      await productsService.updateProduct(getProductId(req), req.body),
    );
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await productsService.deleteProduct(getProductId(req));
    sendSuccess(res, 200, "Product deleted successfully.", { deleted: true });
  },
);
