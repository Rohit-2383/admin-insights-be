import {
  TIME_RANGE_OPTIONS,
  getTimeWindow,
  parseTimeRange,
  type TimeRange,
} from "../../utils/time-range";
import { DashboardUserModel } from "../users/users.model";
import { OrderModel } from "../orders/orders.model";
import { SaleModel } from "../sales/sales.model";
import {
  analyticsInsights,
  channelPerformance,
  customerSegmentation,
  userRetention,
} from "./analytics.mocks";

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

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatCurrency = (value: number): string =>
  `$${Math.round(value).toLocaleString()}`;

const percentChange = (current: number, previous: number): number =>
  previous === 0
    ? current > 0
      ? 100
      : 0
    : ((current - previous) / previous) * 100;

const round1 = (value: number): number => Math.round(value * 10) / 10;

interface AggregateTotal {
  total: number;
}

interface RevenueBucket {
  _id: number;
  revenue: number;
}

interface ProductPerfRow {
  _id: string;
  sales: number;
  revenue: number;
}

const revenueBucketExpression = (range: TimeRange) => {
  switch (range) {
    case "this-week":
      return { $dayOfWeek: "$occurredAt" };
    case "this-month":
    case "this-quarter":
      return { $month: "$occurredAt" };
    case "this-year":
      return { $ceil: { $divide: [{ $month: "$occurredAt" }, 3] } };
  }
};

const revenueBucketLabel = (range: TimeRange, bucket: number): string => {
  switch (range) {
    case "this-week":
      return WEEKDAY_LABELS[bucket - 1] ?? `D${bucket}`;
    case "this-month":
    case "this-quarter":
      return MONTH_LABELS[bucket - 1] ?? `M${bucket}`;
    case "this-year":
      return `Q${bucket}`;
  }
};

export const getAnalyticsDashboardData = async (rawRange: unknown) => {
  const range = parseTimeRange(rawRange);
  const window = getTimeWindow(range);

  const currentMatch = {
    occurredAt: { $gte: window.start, $lt: window.end },
  };
  const previousMatch = {
    occurredAt: { $gte: window.previousStart, $lt: window.previousEnd },
  };

  const [
    currentRevenueRow,
    previousRevenueRow,
    currentOrdersCount,
    previousOrdersCount,
    currentNewUsersCount,
    previousNewUsersCount,
    revenueBuckets,
    productPerformance,
  ] = await Promise.all([
    SaleModel.aggregate<AggregateTotal>([
      { $match: currentMatch },
      { $group: { _id: null, total: { $sum: "$amount" } } },
      { $project: { _id: 0, total: 1 } },
    ]),
    SaleModel.aggregate<AggregateTotal>([
      { $match: previousMatch },
      { $group: { _id: null, total: { $sum: "$amount" } } },
      { $project: { _id: 0, total: 1 } },
    ]),
    OrderModel.countDocuments(currentMatch),
    OrderModel.countDocuments(previousMatch),
    DashboardUserModel.countDocuments({
      createdAt: { $gte: window.start, $lt: window.end },
    }),
    DashboardUserModel.countDocuments({
      createdAt: { $gte: window.previousStart, $lt: window.previousEnd },
    }),
    SaleModel.aggregate<RevenueBucket>([
      { $match: currentMatch },
      {
        $group: {
          _id: revenueBucketExpression(range),
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    SaleModel.aggregate<ProductPerfRow>([
      { $match: currentMatch },
      {
        $group: {
          _id: "$productName",
          sales: { $sum: "$quantity" },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const currentRevenue = currentRevenueRow[0]?.total ?? 0;
  const previousRevenue = previousRevenueRow[0]?.total ?? 0;
  const previousRevenueWithGrowthTarget = previousRevenue * 1.1;

  const overviewCards = [
    {
      name: "Revenue",
      value: formatCurrency(currentRevenue),
      change: round1(percentChange(currentRevenue, previousRevenue)),
      iconKey: "DollarSign" as const,
    },
    {
      name: "Users",
      value: currentNewUsersCount.toLocaleString(),
      change: round1(
        percentChange(currentNewUsersCount, previousNewUsersCount),
      ),
      iconKey: "Users" as const,
    },
    {
      name: "Orders",
      value: currentOrdersCount.toLocaleString(),
      change: round1(percentChange(currentOrdersCount, previousOrdersCount)),
      iconKey: "ShoppingBag" as const,
    },
    {
      name: "Page Views",
      value: "—",
      change: 0,
      iconKey: "Eye" as const,
    },
  ];

  // Target is derived from the previous period plus an aspirational +10% growth.
  // Swap in a real target table once business sets quarterly goals.
  const revenueVsTarget = revenueBuckets.map((row) => ({
    month: revenueBucketLabel(range, row._id),
    revenue: row.revenue,
    target: Math.round(previousRevenueWithGrowthTarget / Math.max(revenueBuckets.length, 1)),
  }));

  return {
    overviewCards,
    availableRanges: TIME_RANGE_OPTIONS,
    selectedRange: range,
    revenueVsTarget,
    channelPerformance,
    productPerformance: productPerformance.map((row) => ({
      name: row._id,
      sales: row.sales,
      revenue: row.revenue,
      profit: Math.round(row.revenue * 0.3),
    })),
    userRetention,
    customerSegmentation,
    insights: analyticsInsights,
  };
};
