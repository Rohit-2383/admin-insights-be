import { Schema, model, type HydratedDocument, type Model } from "mongoose";

export interface ProductAttrs {
  name: string;
  category: string;
  price: number;
  stock: number;
  sales: number;
  imageUrl: string;
}

export type ProductDocument = HydratedDocument<ProductAttrs>;
export type ProductModelType = Model<ProductAttrs>;

const productSchema = new Schema<ProductAttrs>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sales: { type: Number, required: true, min: 0, default: 0, index: true },
    imageUrl: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

export const ProductModel = model<ProductAttrs>("Product", productSchema);

// Tunable thresholds for the dashboard summary cards.
export const LOW_STOCK_THRESHOLD = 50;
export const TOP_SELLING_THRESHOLD = 500;
