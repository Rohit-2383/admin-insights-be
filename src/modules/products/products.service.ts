import { ApiError } from "../../middlewares/error.middleware";
import {
  assertObjectId,
  assertRecord,
  getNumber,
  getString,
} from "../../utils/validation";
import {
  LOW_STOCK_THRESHOLD,
  ProductModel,
  TOP_SELLING_THRESHOLD,
  type ProductAttrs,
} from "./products.model";

const formatNumber = (value: number): string => value.toLocaleString();
const formatCurrency = (value: number): string =>
  `$${Math.round(value).toLocaleString()}`;

interface FacetResult {
  summary: Array<{
    totalProducts: number;
    topSelling: number;
    lowStock: number;
    totalRevenue: number;
  }>;
  products: Array<ProductAttrs & { _id: unknown; id: string }>;
  categoryDistribution: Array<{ name: string; value: number }>;
}

export const getProductsDashboardData = async () => {
  const [result] = await ProductModel.aggregate<FacetResult>([
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              topSelling: {
                $sum: {
                  $cond: [{ $gte: ["$sales", TOP_SELLING_THRESHOLD] }, 1, 0],
                },
              },
              lowStock: {
                $sum: {
                  $cond: [{ $lt: ["$stock", LOW_STOCK_THRESHOLD] }, 1, 0],
                },
              },
              totalRevenue: {
                $sum: { $multiply: ["$price", "$sales"] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalProducts: 1,
              topSelling: 1,
              lowStock: 1,
              totalRevenue: 1,
            },
          },
        ],
        products: [
          { $sort: { sales: -1, createdAt: -1 } },
          {
            $project: {
              id: "$_id",
              _id: 0,
              name: 1,
              category: 1,
              price: 1,
              stock: 1,
              sales: 1,
              imageUrl: 1,
            },
          },
        ],
        categoryDistribution: [
          {
            $group: {
              _id: "$category",
              value: { $sum: "$sales" },
            },
          },
          { $project: { _id: 0, name: "$_id", value: 1 } },
          { $sort: { value: -1 } },
        ],
      },
    },
  ]);

  const summary = result?.summary[0] ?? {
    totalProducts: 0,
    topSelling: 0,
    lowStock: 0,
    totalRevenue: 0,
  };

  return {
    stats: [
      { name: "Total Products", value: formatNumber(summary.totalProducts) },
      { name: "Top Selling", value: formatNumber(summary.topSelling) },
      { name: "Low Stock", value: formatNumber(summary.lowStock) },
      { name: "Total Revenue", value: formatCurrency(summary.totalRevenue) },
    ],
    products: result?.products ?? [],
    categoryDistribution: result?.categoryDistribution ?? [],
  };
};

const parseProductPayload = (payload: unknown): ProductAttrs => {
  const input = assertRecord(payload, "Product payload is invalid.");

  return {
    name: getString(input, "name", "Product name"),
    category: getString(input, "category", "Category"),
    price: getNumber(input, "price", "Price", { minimum: 0 }),
    stock: getNumber(input, "stock", "Stock", { integer: true, minimum: 0 }),
    sales: getNumber(input, "sales", "Sales", { integer: true, minimum: 0 }),
    imageUrl:
      typeof (input as { imageUrl?: unknown }).imageUrl === "string"
        ? ((input as { imageUrl?: string }).imageUrl ?? "")
        : "",
  };
};

export const createProduct = async (payload: unknown) => {
  const attrs = parseProductPayload(payload);
  const created = await ProductModel.create(attrs);
  return created.toJSON();
};

export const updateProduct = async (productId: string, payload: unknown) => {
  assertObjectId(productId, "Product id");
  const attrs = parseProductPayload(payload);

  const updated = await ProductModel.findByIdAndUpdate(productId, attrs, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new ApiError(404, "Product not found.");
  }

  return updated.toJSON();
};

export const deleteProduct = async (productId: string): Promise<void> => {
  assertObjectId(productId, "Product id");
  const deleted = await ProductModel.findByIdAndDelete(productId);

  if (!deleted) {
    throw new ApiError(404, "Product not found.");
  }
};
