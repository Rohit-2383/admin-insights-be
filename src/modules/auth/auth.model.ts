import bcrypt from "bcryptjs";
import { Schema, model, type HydratedDocument, type Model } from "mongoose";
import { env } from "../../config/env";
import { BUSINESS_TYPES, type BusinessType, type UserRole } from "./auth.types";

export interface AuthUserAttrs {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  location: string;
  businessType: BusinessType;
  passwordHash: string;
  role: UserRole;
}

export interface AuthUserMethods {
  comparePassword(plain: string): Promise<boolean>;
}

export interface AuthUserModelType
  extends Model<AuthUserAttrs, Record<string, never>, AuthUserMethods> {
  hashPassword(plain: string): Promise<string>;
}

export type AuthUserDocument = HydratedDocument<AuthUserAttrs, AuthUserMethods>;

const authUserSchema = new Schema<
  AuthUserAttrs,
  AuthUserModelType,
  AuthUserMethods
>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    location: { type: String, required: true, trim: true },
    businessType: {
      type: String,
      enum: BUSINESS_TYPES,
      required: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "user"], default: "admin" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

authUserSchema.methods.comparePassword = function (
  plain: string,
): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

authUserSchema.statics.hashPassword = function (
  plain: string,
): Promise<string> {
  return bcrypt.hash(plain, env.bcryptSaltRounds);
};

export const AuthUserModel = model<AuthUserAttrs, AuthUserModelType>(
  "AuthUser",
  authUserSchema,
);
