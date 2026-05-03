import { type Request, type Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware";
import { sendSuccess } from "../../utils/http";
import * as productsService from "./products.service";

const parseProductId = (value: string | string[] | undefined): number =>
  Number.parseInt(
    Array.isArray(value) ? (value[0] ?? "") : (value ?? ""),
    10,
  );

export const getProductsDashboardData = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Products dashboard data fetched successfully.",
      productsService.getProductsDashboardData(),
    );
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Product updated successfully.",
      productsService.updateProduct(parseProductId(req.params.productId), req.body),
    );
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    productsService.deleteProduct(parseProductId(req.params.productId));
    sendSuccess(res, 200, "Product deleted successfully.", { deleted: true });
  },
);
