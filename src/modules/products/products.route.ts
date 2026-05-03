import { Router } from "express";
import {
  deleteProduct,
  getProductsDashboardData,
  updateProduct,
} from "./products.controller";

const productsRouter = Router();

productsRouter.get("/", getProductsDashboardData);
productsRouter.patch("/:productId", updateProduct);
productsRouter.delete("/:productId", deleteProduct);

export default productsRouter;
