import { Schema, model, type HydratedDocument, type Model, Types } from "mongoose";

export interface SaleAttrs {
  product?: Types.ObjectId;
  productName: string;
  category: string;
  amount: number;
  quantity: number;
  occurredAt: Date;
}

export type SaleDocument = HydratedDocument<SaleAttrs>;
export type SaleModelType = Model<SaleAttrs>;

const saleSchema = new Schema<SaleAttrs>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    occurredAt: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

// Compound index for the most common access pattern: range scans + category filter.
saleSchema.index({ occurredAt: -1, category: 1 });

export const SaleModel = model<SaleAttrs>("Sale", saleSchema);
