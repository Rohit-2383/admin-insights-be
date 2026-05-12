import { ApiError } from "../../middlewares/error.middleware";
import {
  assertRecord,
  getBoolean,
  getEmail,
  getNumber,
  getString,
} from "../../utils/validation";
import {
  type AuthUser,
  changePassword as changeAuthPassword,
  deleteAccount as deleteAuthAccount,
  updateCurrentUserProfile,
} from "../auth/auth.service";
import {
  DEFAULT_CONNECTED_ACCOUNTS,
  UserSettingsModel,
  type UserSettingsDocument,
} from "./settings.model";

const splitFullName = (
  fullName: string,
): { firstName: string; lastName: string } => {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);

  return {
    firstName: firstName || "User",
    lastName: rest.join(" ") || "User",
  };
};

const buildProfileFromAuthUser = (
  user: AuthUser,
): { name: string; email: string; role: string; location: string } => ({
  name: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  role: "Administrator",
  location: user.location,
});

const ensureSettings = async (user: AuthUser): Promise<UserSettingsDocument> => {
  const profileSeed = buildProfileFromAuthUser(user);

  // upsert + return: creates with defaults on first read, refreshes derived
  // profile fields (name/email/location) from the source of truth (AuthUser).
  const doc = await UserSettingsModel.findOneAndUpdate(
    { user: user.id },
    {
      $setOnInsert: {
        user: user.id,
        connectedAccounts: DEFAULT_CONNECTED_ACCOUNTS,
      },
      $set: {
        "profile.name": profileSeed.name,
        "profile.email": profileSeed.email,
        "profile.location": profileSeed.location,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  );

  return doc;
};

export const getSettingsPageData = async (user: AuthUser) => {
  const doc = await ensureSettings(user);
  return doc.toJSON();
};

export const updateProfile = async (user: AuthUser, payload: unknown) => {
  const input = assertRecord(payload, "Profile payload is invalid.");
  const name = getString(input, "name", "Full name");
  const email = getEmail(input, "email");
  const role = getString(input, "role", "Role");
  const location = getString(input, "location", "Location");

  const { firstName, lastName } = splitFullName(name);
  const updatedUser = await updateCurrentUserProfile(user.id, {
    firstName,
    lastName,
    email,
    location,
  });

  await ensureSettings(updatedUser);

  const doc = await UserSettingsModel.findOneAndUpdate(
    { user: updatedUser.id },
    {
      $set: {
        "profile.name": name,
        "profile.email": email,
        "profile.role": role,
        "profile.location": location,
      },
    },
    { new: true, runValidators: true },
  );

  if (!doc) {
    throw new ApiError(404, "User settings not found.");
  }

  return doc.toJSON();
};

export const updateNotifications = async (user: AuthUser, payload: unknown) => {
  const input = assertRecord(payload, "Notification payload is invalid.");
  await ensureSettings(user);

  const doc = await UserSettingsModel.findOneAndUpdate(
    { user: user.id },
    {
      $set: {
        "notifications.push": getBoolean(input, "push", "Push notifications"),
        "notifications.email": getBoolean(input, "email", "Email notifications"),
        "notifications.sms": getBoolean(input, "sms", "SMS notifications"),
      },
    },
    { new: true, runValidators: true },
  );

  if (!doc) {
    throw new ApiError(404, "User settings not found.");
  }

  return doc.toJSON();
};

export const updateSecurity = async (user: AuthUser, payload: unknown) => {
  const input = assertRecord(payload, "Security payload is invalid.");
  await ensureSettings(user);

  const doc = await UserSettingsModel.findOneAndUpdate(
    { user: user.id },
    {
      $set: {
        "security.twoFactorEnabled": getBoolean(
          input,
          "twoFactorEnabled",
          "Two-factor authentication",
        ),
      },
    },
    { new: true, runValidators: true },
  );

  if (!doc) {
    throw new ApiError(404, "User settings not found.");
  }

  return doc.toJSON();
};

export const changePassword = async (user: AuthUser, payload: unknown) => {
  const input = assertRecord(payload, "Password payload is invalid.");
  const currentPassword = getString(
    input,
    "currentPassword",
    "Current password",
    6,
  );
  const newPassword = getString(input, "newPassword", "New password", 6);

  await changeAuthPassword(user.id, currentPassword, newPassword);
  return { updated: true };
};

export const updateConnectedAccount = async (
  user: AuthUser,
  accountId: string,
  payload: unknown,
) => {
  const input = assertRecord(payload, "Connected account payload is invalid.");
  const numericId = getNumber({ accountId }, "accountId", "Account id", {
    integer: true,
    minimum: 1,
  });
  const connected = getBoolean(input, "connected", "Connected state");

  await ensureSettings(user);

  const doc = await UserSettingsModel.findOneAndUpdate(
    { user: user.id, "connectedAccounts.id": numericId },
    {
      $set: { "connectedAccounts.$.connected": connected },
    },
    { new: true, runValidators: true },
  );

  if (!doc) {
    throw new ApiError(404, "Connected account not found.");
  }

  return doc.toJSON();
};

export const deleteAccount = async (user: AuthUser) => {
  await deleteAuthAccount(user.id);
  await UserSettingsModel.deleteOne({ user: user.id });
  return { deleted: true };
};
