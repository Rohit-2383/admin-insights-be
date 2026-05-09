import { Schema, model, type HydratedDocument, type Model } from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../../config/env";

export interface AuthUserAttrs {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  location: string;
  role: "admin" | "user";
}

export interface AuthUserMethods {
  comparePassword(plain: string): Promise<boolean>;
}

export interface AuthUserModel extends Model<AuthUserAttrs, Record<string, never>, AuthUserMethods> {
  hashPassword(plain: string): Promise<string>;
}

export type AuthUserDocument = HydratedDocument<AuthUserAttrs, AuthUserMethods>;

const authUserSchema = new Schema<AuthUserAttrs, AuthUserModel, AuthUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    location: { type: String, default: "", trim: true },
    role: { type: String, enum: ["admin", "user"], default: "admin" },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

authUserSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

authUserSchema.statics.hashPassword = function (plain: string): Promise<string> {
  return bcrypt.hash(plain, env.bcryptSaltRounds);
};

export const AuthUserModel = model<AuthUserAttrs, AuthUserModel>("AuthUser", authUserSchema);
