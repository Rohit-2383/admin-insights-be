import { ApiError } from "../../middlewares/error.middleware";
import {
  deleteProductRecord,
  getProductsPageData,
  updateProductRecord,
} from "../../store/admin.store";
import { assertRecord, getNumber, getString } from "../../utils/validation";

export const getProductsDashboardData = () => getProductsPageData();

export const updateProduct = (productId: number, payload: unknown) => {
  const input = assertRecord(payload, "Product payload is invalid.");
  const updatedProduct = updateProductRecord(productId, {
    name: getString(input, "name", "Product name"),
    category: getString(input, "category", "Category"),
    price: getNumber(input, "price", "Price", { minimum: 0 }),
    stock: getNumber(input, "stock", "Stock", { integer: true, minimum: 0 }),
    sales: getNumber(input, "sales", "Sales", { integer: true, minimum: 0 }),
  });

  if (!updatedProduct) {
    throw new ApiError(404, "Product not found.");
  }

  return updatedProduct;
};

export const deleteProduct = (productId: number): void => {
  const deleted = deleteProductRecord(productId);

  if (!deleted) {
    throw new ApiError(404, "Product not found.");
  }
};
