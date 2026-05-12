import { ApiError } from "../middlewares/error.middleware";

export const TIME_RANGES = [
  "this-week",
  "this-month",
  "this-quarter",
  "this-year",
] as const;

export type TimeRange = (typeof TIME_RANGES)[number];

export interface TimeRangeOption {
  label: string;
  value: TimeRange;
}

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { label: "This Week", value: "this-week" },
  { label: "This Month", value: "this-month" },
  { label: "This Quarter", value: "this-quarter" },
  { label: "This Year", value: "this-year" },
];

export const parseTimeRange = (value: unknown): TimeRange => {
  if (typeof value !== "string" || value.trim() === "") {
    return "this-month";
  }

  const normalized = value.trim().toLowerCase() as TimeRange;

  if (!TIME_RANGES.includes(normalized)) {
    throw new ApiError(400, "Range is invalid.");
  }

  return normalized;
};

export interface TimeWindow {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
}

/**
 * Returns the date window for the given range, plus the immediately-preceding
 * window of the same length (used to compute growth vs. previous period).
 */
export const getTimeWindow = (range: TimeRange, now: Date = new Date()): TimeWindow => {
  const end = now;
  let start: Date;

  switch (range) {
    case "this-week":
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case "this-month":
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      break;
    case "this-quarter":
      start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      break;
    case "this-year":
      start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  const lengthMs = end.getTime() - start.getTime();
  const previousEnd = start;
  const previousStart = new Date(start.getTime() - lengthMs);

  return { start, end, previousStart, previousEnd };
};
