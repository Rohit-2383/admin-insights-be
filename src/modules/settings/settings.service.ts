import { ApiError } from "../../middlewares/error.middleware";
import {
  type AuthUser,
  changePassword as changeAuthPassword,
  deleteAccount as deleteAuthAccount,
  updateCurrentUserProfile,
} from "../auth/auth.service";
import {
  deleteUserSettings,
  getUserSettings,
  updateUserConnectedAccount,
  updateUserNotificationPreferences,
  updateUserSecurityPreferences,
  updateUserSettingsProfile,
} from "../../store/admin.store";
import {
  assertRecord,
  getBoolean,
  getEmail,
  getNumber,
  getString,
} from "../../utils/validation";

const splitFullName = (
  fullName: string,
): { firstName: string; lastName: string } => {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);

  return {
    firstName: firstName || "User",
    lastName: rest.join(" ") || "User",
  };
};

const buildProfileSeed = (user: AuthUser) => ({
  name: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  role: "Administrator",
  location: user.location,
});

export const getSettingsPageData = (user: AuthUser) =>
  getUserSettings(user.id, buildProfileSeed(user));

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
  const currentSettings = getUserSettings(
    updatedUser.id,
    buildProfileSeed(updatedUser),
  );

  return updateUserSettingsProfile(updatedUser.id, {
    ...currentSettings.profile,
    name,
    email,
    role,
    location,
  });
};

export const updateNotifications = (user: AuthUser, payload: unknown) => {
  const input = assertRecord(payload, "Notification payload is invalid.");
  getUserSettings(user.id, buildProfileSeed(user));

  return updateUserNotificationPreferences(user.id, {
    push: getBoolean(input, "push", "Push notifications"),
    email: getBoolean(input, "email", "Email notifications"),
    sms: getBoolean(input, "sms", "SMS notifications"),
  });
};

export const updateSecurity = (user: AuthUser, payload: unknown) => {
  const input = assertRecord(payload, "Security payload is invalid.");
  getUserSettings(user.id, buildProfileSeed(user));

  return updateUserSecurityPreferences(user.id, {
    twoFactorEnabled: getBoolean(
      input,
      "twoFactorEnabled",
      "Two-factor authentication",
    ),
  });
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

export const updateConnectedAccount = (
  user: AuthUser,
  accountId: string,
  payload: unknown,
) => {
  const input = assertRecord(payload, "Connected account payload is invalid.");
  getUserSettings(user.id, buildProfileSeed(user));
  const nextSettings = updateUserConnectedAccount(
    user.id,
    getNumber({ accountId }, "accountId", "Account id", {
      integer: true,
      minimum: 1,
    }),
    getBoolean(input, "connected", "Connected state"),
  );

  if (!nextSettings) {
    throw new ApiError(404, "Connected account not found.");
  }

  return nextSettings;
};

export const deleteAccount = async (user: AuthUser) => {
  await deleteAuthAccount(user.id);
  deleteUserSettings(user.id);
  return { deleted: true };
};
