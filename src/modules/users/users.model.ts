import { Schema, model, type HydratedDocument, type Model } from "mongoose";

export const DASHBOARD_USER_STATUSES = ["Active", "Inactive"] as const;
export type DashboardUserStatus = (typeof DASHBOARD_USER_STATUSES)[number];

export interface DashboardUserAttrs {
  name: string;
  email: string;
  role: string;
  status: DashboardUserStatus;
}

export type DashboardUserDocument = HydratedDocument<DashboardUserAttrs>;
export type DashboardUserModelType = Model<DashboardUserAttrs>;

const dashboardUserSchema = new Schema<DashboardUserAttrs>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: DASHBOARD_USER_STATUSES,
      default: "Active",
      index: true,
    },
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

export const DashboardUserModel = model<DashboardUserAttrs>(
  "DashboardUser",
  dashboardUserSchema,
);
