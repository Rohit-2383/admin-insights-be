import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductsDashboardData,
  updateProduct,
} from "./products.controller";

const productsRouter = Router();

productsRouter.get("/", getProductsDashboardData);
productsRouter.post("/", createProduct);
productsRouter.patch("/:productId", updateProduct);
productsRouter.delete("/:productId", deleteProduct);

export default productsRouter;
