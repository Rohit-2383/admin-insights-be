import { TimeRange, getSalesPageData } from "../../store/admin.store";
import { ApiError } from "../../middlewares/error.middleware";

const TIME_RANGES: TimeRange[] = [
  "this-week",
  "this-month",
  "this-quarter",
  "this-year",
];

export const parseTimeRange = (value: unknown): TimeRange => {
  if (typeof value !== "string" || value.trim() === "") {
    return "this-month";
  }

  const normalizedValue = value.trim().toLowerCase() as TimeRange;

  if (!TIME_RANGES.includes(normalizedValue)) {
    throw new ApiError(400, "Range is invalid.");
  }

  return normalizedValue;
};

export const getSalesDashboardData = (range: unknown) =>
  getSalesPageData(parseTimeRange(range));
