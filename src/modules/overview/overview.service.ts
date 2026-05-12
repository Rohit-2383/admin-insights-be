import { DashboardUserModel } from "../users/users.model";
import { ProductModel } from "../products/products.model";
import { SaleModel } from "../sales/sales.model";
import { salesChannels } from "./overview.mocks";

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

const NEW_USERS_WINDOW_DAYS = 30;

interface MonthBucket {
  _id: { year: number; month: number };
  sales: number;
}

interface CategoryBucket {
  _id: string;
  value: number;
}

interface AggregateTotal {
  total: number;
}

export const getOverviewPageData = async () => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const newUsersSince = new Date(
    Date.now() - NEW_USERS_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );

  const [
    totalRevenueRows,
    newUsersCount,
    totalProductsCount,
    monthlySales,
    categoryDistribution,
  ] = await Promise.all([
    SaleModel.aggregate<AggregateTotal>([
      { $group: { _id: null, total: { $sum: "$amount" } } },
      { $project: { _id: 0, total: 1 } },
    ]),
    DashboardUserModel.countDocuments({ createdAt: { $gte: newUsersSince } }),
    ProductModel.countDocuments(),
    SaleModel.aggregate<MonthBucket>([
      { $match: { occurredAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$occurredAt" },
            month: { $month: "$occurredAt" },
          },
          sales: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    ProductModel.aggregate<CategoryBucket>([
      { $group: { _id: "$category", value: { $sum: "$sales" } } },
      { $sort: { value: -1 } },
      { $limit: 8 },
    ]),
  ]);

  const totalRevenue = totalRevenueRows[0]?.total ?? 0;

  const salesOverview = monthlySales.map((row) => ({
    name: MONTH_LABELS[row._id.month - 1] ?? `M${row._id.month}`,
    sales: row.sales,
  }));

  return {
    stats: [
      { name: "Total Sales", value: formatCurrency(totalRevenue) },
      { name: "New Users", value: newUsersCount.toLocaleString() },
      { name: "Total Products", value: totalProductsCount.toLocaleString() },
      { name: "Conversion Rate", value: "—" },
    ],
    salesOverview,
    categoryDistribution: categoryDistribution.map((row) => ({
      name: row._id,
      value: row.value,
    })),
    salesChannels,
  };
};
