import { ApiError } from "../../middlewares/error.middleware";
import {
  assertObjectId,
  assertRecord,
  getEmail,
  getEnumValue,
  getString,
} from "../../utils/validation";
import {
  DASHBOARD_USER_STATUSES,
  DashboardUserModel,
  type DashboardUserAttrs,
} from "./users.model";
import { userActivityHeatmap, userDemographics } from "./users.mocks";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const startOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

interface UserSummaryRow {
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
  inactiveUsers: number;
}

interface UserGrowthRow {
  _id: { year: number; month: number };
  users: number;
}

interface FacetResult {
  summary: UserSummaryRow[];
  users: Array<DashboardUserAttrs & { id: string }>;
  userGrowth: UserGrowthRow[];
}

export const getUsersDashboardData = async () => {
  const todayStart = startOfToday();

  const [result] = await DashboardUserModel.aggregate<FacetResult>([
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalUsers: { $sum: 1 },
              newUsersToday: {
                $sum: { $cond: [{ $gte: ["$createdAt", todayStart] }, 1, 0] },
              },
              activeUsers: {
                $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
              },
              inactiveUsers: {
                $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalUsers: 1,
              newUsersToday: 1,
              activeUsers: 1,
              inactiveUsers: 1,
            },
          },
        ],
        users: [
          { $sort: { createdAt: -1 } },
          {
            $project: {
              id: "$_id",
              _id: 0,
              name: 1,
              email: 1,
              role: 1,
              status: 1,
            },
          },
        ],
        userGrowth: [
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              users: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ],
      },
    },
  ]);

  const summary = result?.summary[0] ?? {
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  };

  // Approximation: real churn requires period-over-period analysis.
  // Reported as the inactive share of the current population.
  const churnRate =
    summary.totalUsers === 0
      ? "0%"
      : `${((summary.inactiveUsers / summary.totalUsers) * 100).toFixed(1)}%`;

  const userGrowth = (result?.userGrowth ?? []).map((row) => ({
    month: MONTH_LABELS[row._id.month - 1] ?? `M${row._id.month}`,
    users: row.users,
  }));

  return {
    stats: [
      { name: "Total Users", value: summary.totalUsers.toLocaleString() },
      {
        name: "New Users Today",
        value: summary.newUsersToday.toLocaleString(),
      },
      { name: "Active Users", value: summary.activeUsers.toLocaleString() },
      { name: "Churn Rate", value: churnRate },
    ],
    users: result?.users ?? [],
    userGrowth,
    userActivityHeatmap,
    userDemographics,
  };
};

const parseUserPayload = (payload: unknown): DashboardUserAttrs => {
  const input = assertRecord(payload, "User payload is invalid.");

  return {
    name: getString(input, "name", "Full name"),
    email: getEmail(input, "email"),
    role: getString(input, "role", "Role"),
    status: getEnumValue(input, "status", "Status", DASHBOARD_USER_STATUSES),
  };
};

export const createUser = async (payload: unknown) => {
  const attrs = parseUserPayload(payload);
  const created = await DashboardUserModel.create(attrs);
  return created.toJSON();
};

export const updateUser = async (userId: string, payload: unknown) => {
  assertObjectId(userId, "User id");
  const attrs = parseUserPayload(payload);

  const updated = await DashboardUserModel.findByIdAndUpdate(userId, attrs, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new ApiError(404, "User not found.");
  }

  return updated.toJSON();
};

export const deleteUser = async (userId: string): Promise<void> => {
  assertObjectId(userId, "User id");
  const deleted = await DashboardUserModel.findByIdAndDelete(userId);

  if (!deleted) {
    throw new ApiError(404, "User not found.");
  }
};
