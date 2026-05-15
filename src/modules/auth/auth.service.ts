import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { ApiError } from "../../middlewares/error.middleware";
import {
  assertRecord,
  getEmail,
  getNumber,
  getString,
  type UnknownRecord,
} from "../../utils/validation";
import { AuthUserModel, type AuthUserDocument } from "./auth.model";
import {
  BUSINESS_TYPES,
  type AuthResponse,
  type AuthTokenPayload,
  type AuthUser,
  type BusinessType,
  type BusinessTypeOption,
} from "./auth.types";

export type { AuthUser } from "./auth.types";

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const toAuthUser = (doc: AuthUserDocument): AuthUser => ({
  id: doc.id,
  firstName: doc.firstName,
  lastName: doc.lastName,
  age: doc.age,
  email: doc.email,
  location: doc.location,
  businessType: doc.businessType,
  role: doc.role,
  createdAt: doc.get("createdAt") as Date,
  updatedAt: doc.get("updatedAt") as Date,
});

const signToken = (user: Pick<AuthUser, "id" | "email" | "role">): string => {
  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as NonNullable<SignOptions["expiresIn"]>,
  };

  return jwt.sign(payload, env.jwtSecret, options);
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  try {
    return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
  } catch {
    throw new ApiError(401, "Authentication token is invalid or expired.");
  }
};

const normalizeBusinessType = (
  payload: UnknownRecord,
  key: string,
): BusinessType => {
  const raw = getString(payload, key, "Business type");
  const normalized = raw.trim().replace(/[\s-]+/g, "_").toUpperCase();

  if (!BUSINESS_TYPES.includes(normalized as BusinessType)) {
    throw new ApiError(400, "Business type is invalid.");
  }

  return normalized as BusinessType;
};

export const getBusinessTypes = (): BusinessTypeOption[] =>
  BUSINESS_TYPES.map((value) => ({
    value,
    label: toTitleCase(value.replace(/_/g, " ")),
  }));

export const getCurrentUser = async (
  userId: string,
): Promise<AuthUser | null> => {
  const doc = await AuthUserModel.findById(userId);
  return doc ? toAuthUser(doc) : null;
};

export const signup = async (payload: unknown): Promise<AuthResponse> => {
  const input = assertRecord(payload, "Signup payload is invalid.");
  const firstName = toTitleCase(getString(input, "firstName", "First name"));
  const lastName = toTitleCase(getString(input, "lastName", "Last name"));
  const age = getNumber(input, "age", "Age", { integer: true, minimum: 1 });
  const email = getEmail(input, "email");
  const location = toTitleCase(getString(input, "location", "Location"));
  const businessType = normalizeBusinessType(input, "businessType");
  const password = getString(input, "password", "Password", 6);

  const existing = await AuthUserModel.exists({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const passwordHash = await AuthUserModel.hashPassword(password);
  const created = await AuthUserModel.create({
    firstName,
    lastName,
    age,
    email,
    location,
    businessType,
    passwordHash,
    role: "admin",
  });

  const user = toAuthUser(created);
  return { user, token: signToken(user) };
};

export const login = async (payload: unknown): Promise<AuthResponse> => {
  const input = assertRecord(payload, "Login payload is invalid.");
  const email = getEmail(input, "email");
  const password = getString(input, "password", "Password", 6);

  const doc = await AuthUserModel.findOne({ email }).select("+passwordHash");
  if (!doc) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const matches = await doc.comparePassword(password);
  if (!matches) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const user = toAuthUser(doc);
  return { user, token: signToken(user) };
};

export const updateCurrentUserProfile = async (
  userId: string,
  patch: {
    firstName: string;
    lastName: string;
    email: string;
    location: string;
  },
): Promise<AuthUser> => {
  const doc = await AuthUserModel.findByIdAndUpdate(
    userId,
    {
      firstName: patch.firstName,
      lastName: patch.lastName,
      email: patch.email.toLowerCase(),
      location: patch.location,
    },
    { new: true, runValidators: true },
  );

  if (!doc) {
    throw new ApiError(404, "User not found.");
  }

  return toAuthUser(doc);
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const doc = await AuthUserModel.findById(userId).select("+passwordHash");
  if (!doc) {
    throw new ApiError(404, "User not found.");
  }

  const matches = await doc.comparePassword(currentPassword);
  if (!matches) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  doc.passwordHash = await AuthUserModel.hashPassword(newPassword);
  await doc.save();
};

export const deleteAccount = async (userId: string): Promise<void> => {
  const result = await AuthUserModel.findByIdAndDelete(userId);
  if (!result) {
    throw new ApiError(404, "User not found.");
  }
};
