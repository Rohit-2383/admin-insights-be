export type TimeRange =
  | "this-week"
  | "this-month"
  | "this-quarter"
  | "this-year";

export interface TimeRangeOption {
  label: string;
  value: TimeRange;
}

export interface PageStat {
  name: string;
  value: number | string;
}

export interface ProductRecord {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  sales: number;
  imageUrl: string;
}

export interface DashboardUserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
}

export interface OrderRecord {
  id: string;
  customer: string;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  date: string;
}

export interface SettingsProfile {
  name: string;
  email: string;
  role: string;
  location: string;
  avatarUrl: string;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
}

export interface SecurityPreferences {
  twoFactorEnabled: boolean;
}

export interface ConnectedAccount {
  id: number;
  name: string;
  connected: boolean;
  icon: string;
}

export interface UserSettings {
  profile: SettingsProfile;
  notifications: NotificationPreferences;
  security: SecurityPreferences;
  connectedAccounts: ConnectedAccount[];
}

export interface OverviewCard {
  name: string;
  value: string;
  change: number;
  iconKey: "DollarSign" | "Users" | "ShoppingBag" | "Eye";
}

export interface InsightItem {
  iconKey: "TrendingUp" | "Users" | "ShoppingBag" | "DollarSign";
  color: string;
  insight: string;
}

const cloneValue = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { label: "This Week", value: "this-week" },
  { label: "This Month", value: "this-month" },
  { label: "This Quarter", value: "this-quarter" },
  { label: "This Year", value: "this-year" },
];

const overviewStats: PageStat[] = [
  { name: "Total Sales", value: "$12,345" },
  { name: "New Users", value: "1,234" },
  { name: "Total Products", value: "567" },
  { name: "Conversion Rate", value: "12.5%" },
];

const overviewSalesSeries = [
  { name: "Jul", sales: 4200 },
  { name: "Aug", sales: 3800 },
  { name: "Sep", sales: 5100 },
  { name: "Oct", sales: 4600 },
  { name: "Nov", sales: 5400 },
  { name: "Dec", sales: 7200 },
  { name: "Jan", sales: 6100 },
  { name: "Feb", sales: 5900 },
  { name: "Mar", sales: 6800 },
  { name: "Apr", sales: 6300 },
  { name: "May", sales: 7100 },
  { name: "Jun", sales: 7500 },
];

const categoryDistribution = [
  { name: "Electronics", value: 4500 },
  { name: "Clothing", value: 3200 },
  { name: "Home & Garden", value: 2800 },
  { name: "Books", value: 2100 },
  { name: "Sports & Outdoors", value: 1900 },
];

const salesChannels = [
  { name: "Website", value: 45600 },
  { name: "Mobile App", value: 38200 },
  { name: "Marketplace", value: 29800 },
  { name: "Social Media", value: 18700 },
];

let productSummary = {
  totalProducts: 1234,
  topSelling: 89,
  lowStock: 23,
  totalRevenue: 543210,
};

let products: ProductRecord[] = [
  {
    id: 1,
    name: "Wireless Earbuds",
    category: "Electronics",
    price: 59.99,
    stock: 143,
    sales: 1200,
    imageUrl:
      "https://images.unsplash.com/photo-1627989580309-bfaf3e58af6f?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    name: "Leather Wallet",
    category: "Accessories",
    price: 39.99,
    stock: 89,
    sales: 800,
    imageUrl:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    name: "Smart Watch",
    category: "Electronics",
    price: 199.99,
    stock: 56,
    sales: 650,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 4,
    name: "Yoga Mat",
    category: "Fitness",
    price: 29.99,
    stock: 210,
    sales: 950,
    imageUrl:
      "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 5,
    name: "Coffee Maker",
    category: "Home",
    price: 79.99,
    stock: 78,
    sales: 720,
    imageUrl:
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=60",
  },
];

const productSalesTrend = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4500 },
  { month: "May", sales: 6000 },
  { month: "Jun", sales: 5500 },
];

let userSummary = {
  totalUsers: 152845,
  newUsersToday: 243,
  activeUsers: 98520,
  churnRate: "2.4%",
};

let dashboardUsers: DashboardUserRecord[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Customer",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Customer",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice@example.com",
    role: "Customer",
    status: "Active",
  },
  {
    id: 5,
    name: "Charlie Wilson",
    email: "charlie@example.com",
    role: "Moderator",
    status: "Active",
  },
];

const userGrowthSeries = [
  { month: "Jan", users: 1000 },
  { month: "Feb", users: 1500 },
  { month: "Mar", users: 2000 },
  { month: "Apr", users: 3000 },
  { month: "May", users: 4000 },
  { month: "Jun", users: 5000 },
];

const userActivitySeries = [
  { name: "Mon", "0-4": 20, "4-8": 40, "8-12": 60, "12-16": 80, "16-20": 100, "20-24": 30 },
  { name: "Tue", "0-4": 30, "4-8": 50, "8-12": 70, "12-16": 90, "16-20": 110, "20-24": 40 },
  { name: "Wed", "0-4": 40, "4-8": 60, "8-12": 80, "12-16": 100, "16-20": 120, "20-24": 50 },
  { name: "Thu", "0-4": 50, "4-8": 70, "8-12": 90, "12-16": 110, "16-20": 130, "20-24": 60 },
  { name: "Fri", "0-4": 60, "4-8": 80, "8-12": 100, "12-16": 120, "16-20": 140, "20-24": 70 },
  { name: "Sat", "0-4": 70, "4-8": 90, "8-12": 110, "12-16": 130, "16-20": 150, "20-24": 80 },
  { name: "Sun", "0-4": 80, "4-8": 100, "8-12": 120, "12-16": 140, "16-20": 160, "20-24": 90 },
];

const userDemographics = [
  { name: "18-24", value: 20 },
  { name: "25-34", value: 30 },
  { name: "35-44", value: 25 },
  { name: "45-54", value: 15 },
  { name: "55+", value: 10 },
];

const salesSummary: PageStat[] = [
  { name: "Total Revenue", value: "$1,234,567" },
  { name: "Avg. Order Value", value: "$78.90" },
  { name: "Conversion Rate", value: "3.45%" },
  { name: "Sales Growth", value: "12.3%" },
];

const salesOverviewByRange: Record<TimeRange, { month: string; sales: number }[]> = {
  "this-week": [
    { month: "Mon", sales: 980 },
    { month: "Tue", sales: 1200 },
    { month: "Wed", sales: 1140 },
    { month: "Thu", sales: 1280 },
    { month: "Fri", sales: 1560 },
    { month: "Sat", sales: 1810 },
    { month: "Sun", sales: 1690 },
  ],
  "this-month": [
    { month: "Jan", sales: 4000 },
    { month: "Feb", sales: 3000 },
    { month: "Mar", sales: 5000 },
    { month: "Apr", sales: 4500 },
    { month: "May", sales: 6000 },
    { month: "Jun", sales: 5500 },
    { month: "Jul", sales: 7000 },
  ],
  "this-quarter": [
    { month: "Jan", sales: 12200 },
    { month: "Feb", sales: 13800 },
    { month: "Mar", sales: 14900 },
  ],
  "this-year": [
    { month: "Q1", sales: 38200 },
    { month: "Q2", sales: 42500 },
    { month: "Q3", sales: 44900 },
    { month: "Q4", sales: 47600 },
  ],
};

const salesByCategory = [
  { name: "Electronics", value: 400 },
  { name: "Clothing", value: 300 },
  { name: "Home & Garden", value: 200 },
  { name: "Books", value: 100 },
  { name: "Others", value: 150 },
];

const dailySalesTrend = [
  { name: "Mon", sales: 1000 },
  { name: "Tue", sales: 1200 },
  { name: "Wed", sales: 900 },
  { name: "Thu", sales: 1100 },
  { name: "Fri", sales: 1300 },
  { name: "Sat", sales: 1600 },
  { name: "Sun", sales: 1400 },
];

const orderSummary: PageStat[] = [
  { name: "Total Orders", value: "1,234" },
  { name: "Pending Orders", value: "56" },
  { name: "Completed Orders", value: "1,178" },
  { name: "Total Revenue", value: "$98,765" },
];

const dailyOrdersSeries = [
  { date: "07/01", orders: 45 },
  { date: "07/02", orders: 52 },
  { date: "07/03", orders: 49 },
  { date: "07/04", orders: 60 },
  { date: "07/05", orders: 55 },
  { date: "07/06", orders: 58 },
  { date: "07/07", orders: 62 },
];

const orderDistribution = [
  { name: "Pending", value: 30 },
  { name: "Processing", value: 45 },
  { name: "Shipped", value: 60 },
  { name: "Delivered", value: 120 },
];

const orders: OrderRecord[] = [
  { id: "ORD001", customer: "John Doe", total: 235.4, status: "Delivered", date: "2023-07-01" },
  { id: "ORD002", customer: "Jane Smith", total: 412, status: "Processing", date: "2023-07-02" },
  { id: "ORD003", customer: "Bob Johnson", total: 162.5, status: "Shipped", date: "2023-07-03" },
  { id: "ORD004", customer: "Alice Brown", total: 750.2, status: "Pending", date: "2023-07-04" },
  { id: "ORD005", customer: "Charlie Wilson", total: 95.8, status: "Delivered", date: "2023-07-05" },
  { id: "ORD006", customer: "Eva Martinez", total: 310.75, status: "Processing", date: "2023-07-06" },
  { id: "ORD007", customer: "David Lee", total: 528.9, status: "Shipped", date: "2023-07-07" },
  { id: "ORD008", customer: "Grace Taylor", total: 189.6, status: "Delivered", date: "2023-07-08" },
];

const analyticsOverviewCards: OverviewCard[] = [
  { name: "Revenue", value: "$1,234,567", change: 12.5, iconKey: "DollarSign" },
  { name: "Users", value: "45,678", change: 8.3, iconKey: "Users" },
  { name: "Orders", value: "9,876", change: -3.2, iconKey: "ShoppingBag" },
  { name: "Page Views", value: "1,234,567", change: 15.7, iconKey: "Eye" },
];

const revenueVsTargetByRange: Record<
  TimeRange,
  { month: string; revenue: number; target: number }[]
> = {
  "this-week": [
    { month: "Mon", revenue: 3800, target: 3600 },
    { month: "Tue", revenue: 4200, target: 4000 },
    { month: "Wed", revenue: 3900, target: 4100 },
    { month: "Thu", revenue: 4500, target: 4200 },
    { month: "Fri", revenue: 4800, target: 4300 },
    { month: "Sat", revenue: 5200, target: 4700 },
    { month: "Sun", revenue: 5000, target: 4600 },
  ],
  "this-month": [
    { month: "Jan", revenue: 4000, target: 3800 },
    { month: "Feb", revenue: 3000, target: 3200 },
    { month: "Mar", revenue: 5000, target: 4500 },
    { month: "Apr", revenue: 4500, target: 4200 },
    { month: "May", revenue: 6000, target: 5500 },
    { month: "Jun", revenue: 5500, target: 5800 },
    { month: "Jul", revenue: 7000, target: 6500 },
  ],
  "this-quarter": [
    { month: "Jan", revenue: 13200, target: 12600 },
    { month: "Feb", revenue: 14100, target: 13600 },
    { month: "Mar", revenue: 15200, target: 14500 },
  ],
  "this-year": [
    { month: "Q1", revenue: 40200, target: 38400 },
    { month: "Q2", revenue: 43600, target: 42500 },
    { month: "Q3", revenue: 45200, target: 44000 },
    { month: "Q4", revenue: 48800, target: 47000 },
  ],
};

const channelPerformance = [
  { name: "Organic Search", value: 4000 },
  { name: "Paid Search", value: 3000 },
  { name: "Direct", value: 2000 },
  { name: "Social Media", value: 2780 },
  { name: "Referral", value: 1890 },
  { name: "Email", value: 2390 },
];

const productPerformance = [
  { name: "Product A", sales: 4000, revenue: 2400, profit: 2400 },
  { name: "Product B", sales: 3000, revenue: 1398, profit: 2210 },
  { name: "Product C", sales: 2000, revenue: 9800, profit: 2290 },
  { name: "Product D", sales: 2780, revenue: 3908, profit: 2000 },
  { name: "Product E", sales: 1890, revenue: 4800, profit: 2181 },
];

const userRetention = [
  { name: "Week 1", retention: 100 },
  { name: "Week 2", retention: 75 },
  { name: "Week 3", retention: 60 },
  { name: "Week 4", retention: 50 },
  { name: "Week 5", retention: 45 },
  { name: "Week 6", retention: 40 },
  { name: "Week 7", retention: 38 },
  { name: "Week 8", retention: 35 },
];

const customerSegmentation = [
  { subject: "Engagement", A: 120, B: 110, fullMark: 150 },
  { subject: "Loyalty", A: 98, B: 130, fullMark: 150 },
  { subject: "Satisfaction", A: 86, B: 130, fullMark: 150 },
  { subject: "Spend", A: 99, B: 100, fullMark: 150 },
  { subject: "Frequency", A: 85, B: 90, fullMark: 150 },
  { subject: "Recency", A: 65, B: 85, fullMark: 150 },
];

const analyticsInsights: InsightItem[] = [
  {
    iconKey: "TrendingUp",
    color: "text-green-500",
    insight:
      "Revenue is up 15% compared to last month, driven primarily by a successful email campaign.",
  },
  {
    iconKey: "Users",
    color: "text-blue-500",
    insight:
      "Customer retention has improved by 8% following the launch of the new loyalty program.",
  },
  {
    iconKey: "ShoppingBag",
    color: "text-purple-500",
    insight:
      'Product category "Electronics" shows the highest growth potential based on recent market trends.',
  },
  {
    iconKey: "DollarSign",
    color: "text-yellow-500",
    insight:
      "Optimizing pricing strategy could potentially increase overall profit margins by 5-7%.",
  },
];

const defaultNotifications: NotificationPreferences = {
  push: true,
  email: false,
  sms: true,
};

const defaultSecurity: SecurityPreferences = {
  twoFactorEnabled: false,
};

const defaultConnectedAccounts: ConnectedAccount[] = [
  { id: 1, name: "Google", connected: true, icon: "/google.png" },
  { id: 2, name: "Facebook", connected: false, icon: "/facebook.svg" },
  { id: 3, name: "Twitter", connected: true, icon: "/x.png" },
];

const settingsStore = new Map<string, UserSettings>();

const createDefaultSettings = (profile: Omit<SettingsProfile, "avatarUrl">): UserSettings => ({
  profile: {
    ...profile,
    avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  notifications: cloneValue(defaultNotifications),
  security: cloneValue(defaultSecurity),
  connectedAccounts: cloneValue(defaultConnectedAccounts),
});

export const getOverviewData = () => ({
  stats: cloneValue(overviewStats),
  salesOverview: cloneValue(overviewSalesSeries),
  categoryDistribution: cloneValue(categoryDistribution),
  salesChannels: cloneValue(salesChannels),
});

export const getProductsPageData = () => ({
  stats: [
    { name: "Total Products", value: productSummary.totalProducts.toLocaleString() },
    { name: "Top Selling", value: productSummary.topSelling.toLocaleString() },
    { name: "Low Stock", value: productSummary.lowStock.toLocaleString() },
    { name: "Total Revenue", value: `$${productSummary.totalRevenue.toLocaleString()}` },
  ],
  products: cloneValue(products),
  salesTrend: cloneValue(productSalesTrend),
  categoryDistribution: cloneValue(categoryDistribution),
});

export const updateProductRecord = (
  productId: number,
  updates: Omit<ProductRecord, "id" | "imageUrl">,
): ProductRecord | null => {
  let updatedProduct: ProductRecord | null = null;

  products = products.map((product) => {
    if (product.id !== productId) {
      return product;
    }

    updatedProduct = {
      ...product,
      ...updates,
    };

    return updatedProduct;
  });

  return updatedProduct ? cloneValue(updatedProduct) : null;
};

export const deleteProductRecord = (productId: number): boolean => {
  const nextProducts = products.filter((product) => product.id !== productId);

  if (nextProducts.length === products.length) {
    return false;
  }

  products = nextProducts;
  productSummary = {
    ...productSummary,
    totalProducts: Math.max(productSummary.totalProducts - 1, 0),
  };

  return true;
};

export const getUsersPageData = () => ({
  stats: [
    { name: "Total Users", value: userSummary.totalUsers.toLocaleString() },
    { name: "New Users Today", value: userSummary.newUsersToday.toLocaleString() },
    { name: "Active Users", value: userSummary.activeUsers.toLocaleString() },
    { name: "Churn Rate", value: userSummary.churnRate },
  ],
  users: cloneValue(dashboardUsers),
  userGrowth: cloneValue(userGrowthSeries),
  userActivityHeatmap: cloneValue(userActivitySeries),
  userDemographics: cloneValue(userDemographics),
});

export const updateDashboardUserRecord = (
  userId: number,
  updates: Omit<DashboardUserRecord, "id">,
): DashboardUserRecord | null => {
  let previousStatus: DashboardUserRecord["status"] | null = null;
  let updatedUser: DashboardUserRecord | null = null;
  let nextStatus: DashboardUserRecord["status"] | null = null;

  dashboardUsers = dashboardUsers.map((user) => {
    if (user.id !== userId) {
      return user;
    }

    previousStatus = user.status;
    updatedUser = {
      ...user,
      ...updates,
    };
    nextStatus = updatedUser.status;

    return updatedUser;
  });

  if (!updatedUser || !nextStatus) {
    return null;
  }

  if (previousStatus !== nextStatus) {
    if (previousStatus === "Active") {
      userSummary.activeUsers = Math.max(userSummary.activeUsers - 1, 0);
    }

    if (nextStatus === "Active") {
      userSummary.activeUsers += 1;
    }
  }

  return cloneValue(updatedUser);
};

export const deleteDashboardUserRecord = (userId: number): boolean => {
  const userToDelete = dashboardUsers.find((user) => user.id === userId);

  if (!userToDelete) {
    return false;
  }

  dashboardUsers = dashboardUsers.filter((user) => user.id !== userId);
  userSummary.totalUsers = Math.max(userSummary.totalUsers - 1, 0);

  if (userToDelete.status === "Active") {
    userSummary.activeUsers = Math.max(userSummary.activeUsers - 1, 0);
  }

  return true;
};

export const getSalesPageData = (range: TimeRange) => ({
  stats: cloneValue(salesSummary),
  availableRanges: cloneValue(TIME_RANGE_OPTIONS),
  selectedRange: range,
  overview: cloneValue(salesOverviewByRange[range]),
  byCategory: cloneValue(salesByCategory),
  dailyTrend: cloneValue(dailySalesTrend),
});

export const getOrdersPageData = () => ({
  stats: cloneValue(orderSummary),
  dailyOrders: cloneValue(dailyOrdersSeries),
  orderDistribution: cloneValue(orderDistribution),
  orders: cloneValue(orders),
});

export const getAnalyticsPageData = (range: TimeRange) => ({
  overviewCards: cloneValue(analyticsOverviewCards),
  availableRanges: cloneValue(TIME_RANGE_OPTIONS),
  selectedRange: range,
  revenueVsTarget: cloneValue(revenueVsTargetByRange[range]),
  channelPerformance: cloneValue(channelPerformance),
  productPerformance: cloneValue(productPerformance),
  userRetention: cloneValue(userRetention),
  customerSegmentation: cloneValue(customerSegmentation),
  insights: cloneValue(analyticsInsights),
});

export const getUserSettings = (
  userId: string,
  profileSeed: Omit<SettingsProfile, "avatarUrl">,
): UserSettings => {
  const existingSettings = settingsStore.get(userId);

  if (!existingSettings) {
    settingsStore.set(userId, createDefaultSettings(profileSeed));
  } else {
    existingSettings.profile = {
      ...existingSettings.profile,
      name: profileSeed.name,
      email: profileSeed.email,
      location: profileSeed.location,
    };
  }

  return cloneValue(settingsStore.get(userId)!);
};

export const updateUserSettingsProfile = (
  userId: string,
  profile: SettingsProfile,
): UserSettings => {
  const currentSettings = settingsStore.get(userId) ?? createDefaultSettings(profile);

  currentSettings.profile = cloneValue(profile);
  settingsStore.set(userId, currentSettings);

  return cloneValue(currentSettings);
};

export const updateUserNotificationPreferences = (
  userId: string,
  preferences: NotificationPreferences,
): UserSettings => {
  const currentSettings = settingsStore.get(userId);

  if (!currentSettings) {
    throw new Error("Cannot update notification preferences before settings exist.");
  }

  currentSettings.notifications = cloneValue(preferences);
  settingsStore.set(userId, currentSettings);

  return cloneValue(currentSettings);
};

export const updateUserSecurityPreferences = (
  userId: string,
  preferences: SecurityPreferences,
): UserSettings => {
  const currentSettings = settingsStore.get(userId);

  if (!currentSettings) {
    throw new Error("Cannot update security preferences before settings exist.");
  }

  currentSettings.security = cloneValue(preferences);
  settingsStore.set(userId, currentSettings);

  return cloneValue(currentSettings);
};

export const updateUserConnectedAccount = (
  userId: string,
  accountId: number,
  connected: boolean,
): UserSettings | null => {
  const currentSettings = settingsStore.get(userId);

  if (!currentSettings) {
    return null;
  }

  const nextAccounts = currentSettings.connectedAccounts.map((account) =>
    account.id === accountId ? { ...account, connected } : account,
  );

  if (!nextAccounts.some((account) => account.id === accountId)) {
    return null;
  }

  currentSettings.connectedAccounts = nextAccounts;
  settingsStore.set(userId, currentSettings);

  return cloneValue(currentSettings);
};

export const deleteUserSettings = (userId: string): void => {
  settingsStore.delete(userId);
};
