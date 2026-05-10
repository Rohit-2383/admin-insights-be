import { ApiError } from "../../middlewares/error.middleware";
import {
  deleteDashboardUserRecord,
  getUsersPageData,
  updateDashboardUserRecord,
} from "../../store/admin.store";
import {
  assertRecord,
  getEmail,
  getEnumValue,
  getString,
} from "../../utils/validation";

const USER_STATUSES = ["Active", "Inactive"] as const;

export const getUsersDashboardData = () => getUsersPageData();

export const updateUser = (userId: number, payload: unknown) => {
  const input = assertRecord(payload, "User payload is invalid.");
  const updatedUser = updateDashboardUserRecord(userId, {
    name: getString(input, "name", "Full name"),
    email: getEmail(input, "email"),
    role: getString(input, "role", "Role"),
    status: getEnumValue(input, "status", "Status", USER_STATUSES),
  });

  if (!updatedUser) {
    throw new ApiError(404, "User not found.");
  }

  return updatedUser;
};

export const deleteUser = (userId: number): void => {
  const deleted = deleteDashboardUserRecord(userId);

  if (!deleted) {
    throw new ApiError(404, "User not found.");
  }
};
