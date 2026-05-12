import {
  TIME_RANGE_OPTIONS,
  getTimeWindow,
  parseTimeRange,
  type TimeRange,
} from "../../utils/time-range";
import { SaleModel } from "./sales.model";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

const formatCurrency = (value: number): string =>
  `$${Math.round(value).toLocaleString()}`;

const formatPercent = (value: number, digits = 1): string =>
  `${value.toFixed(digits)}%`;

interface SummaryRow {
  totalRevenue: number;
  totalSales: number;
  totalUnits: number;
}

interface BucketRow {
  _id: number;
  revenue: number;
}

interface CategoryRow {
  _id: string;
  value: number;
}

interface DailyRow {
  _id: number;
  sales: number;
}

interface SalesFacet {
  summary: SummaryRow[];
  overview: BucketRow[];
  byCategory: CategoryRow[];
  dailyTrend: DailyRow[];
}

const overviewGroupExpression = (range: TimeRange) => {
  switch (range) {
    case "this-week":
      // group by day-of-week (1=Sun..7=Sat)
      return { $dayOfWeek: "$occurredAt" };
    case "this-month":
      // group by month (1..12) — preserves last-6-months semantic at the label step
      return { $month: "$occurredAt" };
    case "this-quarter":
      return { $month: "$occurredAt" };
    case "this-year":
      // 1..4 quarter
      return {
        $ceil: { $divide: [{ $month: "$occurredAt" }, 3] },
      };
  }
};

const overviewBucketToLabel = (range: TimeRange, bucket: number): string => {
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

export const getSalesDashboardData = async (rawRange: unknown) => {
  const range = parseTimeRange(rawRange);
  const window = getTimeWindow(range);

  const [result] = await SaleModel.aggregate<SalesFacet>([
    { $match: { occurredAt: { $gte: window.start, $lt: window.end } } },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$amount" },
              totalSales: { $sum: 1 },
              totalUnits: { $sum: "$quantity" },
            },
          },
          { $project: { _id: 0, totalRevenue: 1, totalSales: 1, totalUnits: 1 } },
        ],
        overview: [
          {
            $group: {
              _id: overviewGroupExpression(range),
              revenue: { $sum: "$amount" },
            },
          },
          { $sort: { _id: 1 } },
        ],
        byCategory: [
          {
            $group: {
              _id: "$category",
              value: { $sum: "$amount" },
            },
          },
          { $sort: { value: -1 } },
          { $limit: 8 },
        ],
        dailyTrend: [
          {
            $group: {
              _id: { $dayOfWeek: "$occurredAt" },
              sales: { $sum: "$amount" },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  // Previous window total for growth %
  const prev = await SaleModel.aggregate<{ totalRevenue: number }>([
    {
      $match: {
        occurredAt: { $gte: window.previousStart, $lt: window.previousEnd },
      },
    },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    { $project: { _id: 0, totalRevenue: 1 } },
  ]);

  const summary = result?.summary[0] ?? {
    totalRevenue: 0,
    totalSales: 0,
    totalUnits: 0,
  };

  const previousRevenue = prev[0]?.totalRevenue ?? 0;
  const avgOrderValue =
    summary.totalSales === 0 ? 0 : summary.totalRevenue / summary.totalSales;
  const salesGrowth =
    previousRevenue === 0
      ? 0
      : ((summary.totalRevenue - previousRevenue) / previousRevenue) * 100;

  const overview = (result?.overview ?? []).map((row) => ({
    month: overviewBucketToLabel(range, row._id),
    sales: row.revenue,
  }));

  const byCategory = (result?.byCategory ?? []).map((row) => ({
    name: row._id,
    value: row.value,
  }));

  const dailyTrend = (result?.dailyTrend ?? []).map((row) => ({
    name: WEEKDAY_LABELS[row._id - 1] ?? `D${row._id}`,
    sales: row.sales,
  }));

  return {
    stats: [
      { name: "Total Revenue", value: formatCurrency(summary.totalRevenue) },
      { name: "Avg. Order Value", value: formatCurrency(avgOrderValue) },
      { name: "Total Orders", value: summary.totalSales.toLocaleString() },
      { name: "Sales Growth", value: formatPercent(salesGrowth) },
    ],
    availableRanges: TIME_RANGE_OPTIONS,
    selectedRange: range,
    overview,
    byCategory,
    dailyTrend,
  };
};
