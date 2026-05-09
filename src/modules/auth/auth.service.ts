import jwt, { type SignOptions } from "jsonwebtoken";
import { ApiError } from "../../middlewares/error.middleware";
import { env } from "../../config/env";
import {
  assertRecord,
  getEmail,
  getOptionalString,
  getString,
} from "../../utils/validation";
import { AuthUserModel, type AuthUserDocument } from "./auth.model";
import type { AuthUser, JwtPayload } from "./auth.types";

export type { AuthUser } from "./auth.types";

const toAuthUser = (doc: AuthUserDocument): AuthUser => ({
  id: doc.id,
  email: doc.email,
  firstName: doc.firstName,
  lastName: doc.lastName,
  location: doc.location,
  role: doc.role,
});

const signToken = (user: AuthUser): string => {
  const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtSecret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch {
    throw new ApiError(401, "Invalid or expired token.");
  }
};

export const findAuthUserById = async (id: string): Promise<AuthUser | null> => {
  const doc = await AuthUserModel.findById(id);
  return doc ? toAuthUser(doc) : null;
};

export const register = async (
  payload: unknown,
): Promise<{ user: AuthUser; token: string }> => {
  const input = assertRecord(payload, "Register payload is invalid.");
  const email = getEmail(input);
  const password = getString(input, "password", "Password", 6);
  const firstName = getString(input, "firstName", "First name");
  const lastName = getString(input, "lastName", "Last name");
  const location = getOptionalString(input, "location") ?? "";

  const existing = await AuthUserModel.exists({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const passwordHash = await AuthUserModel.hashPassword(password);
  const created = await AuthUserModel.create({
    email,
    passwordHash,
    firstName,
    lastName,
    location,
    role: "admin",
  });

  const user = toAuthUser(created);
  return { user, token: signToken(user) };
};

export const login = async (
  payload: unknown,
): Promise<{ user: AuthUser; token: string }> => {
  const input = assertRecord(payload, "Login payload is invalid.");
  const email = getEmail(input);
  const password = getString(input, "password", "Password", 6);

  const doc = await AuthUserModel.findOne({ email }).select("+passwordHash");
  if (!doc) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const ok = await doc.comparePassword(password);
  if (!ok) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const user = toAuthUser(doc);
  return { user, token: signToken(user) };
};

export const updateCurrentUserProfile = async (
  userId: string,
  patch: { firstName: string; lastName: string; email: string; location: string },
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
  const ok = await doc.comparePassword(currentPassword);
  if (!ok) {
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
