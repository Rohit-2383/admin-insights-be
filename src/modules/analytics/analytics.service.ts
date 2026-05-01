import { getAnalyticsPageData } from "../../store/admin.store";
import { parseTimeRange } from "../sales/sales.service";

export const getAnalyticsDashboardData = (range: unknown) =>
  getAnalyticsPageData(parseTimeRange(range));
