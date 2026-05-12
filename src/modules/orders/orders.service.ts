import { ApiError } from "../../middlewares/error.middleware";
import {
  assertObjectId,
  assertRecord,
  getEnumValue,
  getNumber,
  getOptionalString,
  getString,
} from "../../utils/validation";
import {
  ORDER_STATUSES,
  OrderModel,
  type OrderAttrs,
  type OrderStatus,
} from "./orders.model";

const formatCurrency = (value: number): string =>
  `$${Math.round(value).toLocaleString()}`;

const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_TREND_DAYS = 7;

const formatDailyDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
};

interface OrderSummaryRow {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

interface OrderListRow {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: OrderStatus;
  occurredAt: Date;
}

interface DistributionRow {
  _id: OrderStatus;
  value: number;
}

interface DailyRow {
  _id: string; // YYYY-MM-DD
  orders: number;
}

interface FacetResult {
  summary: OrderSummaryRow[];
  orders: OrderListRow[];
  orderDistribution: DistributionRow[];
  dailyOrders: DailyRow[];
}

export const getOrdersDashboardData = async () => {
  const sevenDaysAgo = new Date(Date.now() - DAILY_TREND_DAYS * DAY_MS);

  const [result] = await OrderModel.aggregate<FacetResult>([
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              pendingOrders: {
                $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
              },
              completedOrders: {
                $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] },
              },
              totalRevenue: { $sum: "$total" },
            },
          },
          {
            $project: {
              _id: 0,
              totalOrders: 1,
              pendingOrders: 1,
              completedOrders: 1,
              totalRevenue: 1,
            },
          },
        ],
        orders: [
          { $sort: { occurredAt: -1 } },
          {
            $project: {
              id: "$_id",
              _id: 0,
              orderNumber: 1,
              customer: 1,
              total: 1,
              status: 1,
              occurredAt: 1,
            },
          },
        ],
        orderDistribution: [
          { $group: { _id: "$status", value: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
        dailyOrders: [
          { $match: { occurredAt: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$occurredAt" },
              },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  const summary = result?.summary[0] ?? {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  };

  const dailyOrders = (result?.dailyOrders ?? []).map((row) => ({
    date: formatDailyDate(new Date(`${row._id}T00:00:00Z`)),
    orders: row.orders,
  }));

  const orderDistribution = (result?.orderDistribution ?? []).map((row) => ({
    name: row._id,
    value: row.value,
  }));

  return {
    stats: [
      { name: "Total Orders", value: summary.totalOrders.toLocaleString() },
      { name: "Pending Orders", value: summary.pendingOrders.toLocaleString() },
      {
        name: "Completed Orders",
        value: summary.completedOrders.toLocaleString(),
      },
      { name: "Total Revenue", value: formatCurrency(summary.totalRevenue) },
    ],
    dailyOrders,
    orderDistribution,
    orders: result?.orders ?? [],
  };
};

const parseCreatePayload = (
  payload: unknown,
): Omit<OrderAttrs, "orderNumber"> => {
  const input = assertRecord(payload, "Order payload is invalid.");

  const occurredAtRaw = getOptionalString(input, "occurredAt", "Occurred at");
  const occurredAt = occurredAtRaw ? new Date(occurredAtRaw) : new Date();

  if (Number.isNaN(occurredAt.getTime())) {
    throw new ApiError(400, "Occurred at must be a valid date.");
  }

  return {
    customer: getString(input, "customer", "Customer"),
    total: getNumber(input, "total", "Total", { minimum: 0 }),
    status: getEnumValue(input, "status", "Status", ORDER_STATUSES),
    occurredAt,
  };
};

const parseUpdatePayload = (payload: unknown): Partial<OrderAttrs> => {
  const input = assertRecord(payload, "Order payload is invalid.");
  const patch: Partial<OrderAttrs> = {};

  if ("customer" in input) {
    patch.customer = getString(input, "customer", "Customer");
  }
  if ("total" in input) {
    patch.total = getNumber(input, "total", "Total", { minimum: 0 });
  }
  if ("status" in input) {
    patch.status = getEnumValue(input, "status", "Status", ORDER_STATUSES);
  }
  if ("occurredAt" in input) {
    const raw = getString(input, "occurredAt", "Occurred at");
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      throw new ApiError(400, "Occurred at must be a valid date.");
    }
    patch.occurredAt = parsed;
  }

  if (Object.keys(patch).length === 0) {
    throw new ApiError(400, "No updatable fields provided.");
  }

  return patch;
};

export const createOrder = async (payload: unknown) => {
  const attrs = parseCreatePayload(payload);
  const created = await OrderModel.create(attrs);
  return created.toJSON();
};

export const updateOrder = async (orderId: string, payload: unknown) => {
  assertObjectId(orderId, "Order id");
  const patch = parseUpdatePayload(payload);

  const updated = await OrderModel.findByIdAndUpdate(orderId, patch, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new ApiError(404, "Order not found.");
  }

  return updated.toJSON();
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  assertObjectId(orderId, "Order id");
  const deleted = await OrderModel.findByIdAndDelete(orderId);

  if (!deleted) {
    throw new ApiError(404, "Order not found.");
  }
};
