import {
  Schema,
  Types,
  model,
  type HydratedDocument,
  type Model,
} from "mongoose";

export const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderAttrs {
  orderNumber: string;
  customer: string;
  total: number;
  status: OrderStatus;
  occurredAt: Date;
}

export type OrderDocument = HydratedDocument<OrderAttrs>;
export type OrderModelType = Model<OrderAttrs>;

const generateOrderNumber = (): string =>
  `ORD-${new Types.ObjectId().toString().slice(-6).toUpperCase()}`;

const orderSchema = new Schema<OrderAttrs>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      default: generateOrderNumber,
      index: true,
    },
    customer: { type: String, required: true, trim: true },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Pending",
      index: true,
    },
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

orderSchema.index({ occurredAt: -1, status: 1 });

export const OrderModel = model<OrderAttrs>("Order", orderSchema);
