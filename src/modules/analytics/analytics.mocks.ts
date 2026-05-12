// Static fallbacks for analytics charts that need data we don't track yet
// (traffic channels, cohort retention, segmentation rubric, page views).

export const channelPerformance = [
  { name: "Organic Search", value: 4000 },
  { name: "Paid Search", value: 3000 },
  { name: "Direct", value: 2000 },
  { name: "Social Media", value: 2780 },
  { name: "Referral", value: 1890 },
  { name: "Email", value: 2390 },
];

export const userRetention = [
  { name: "Week 1", retention: 100 },
  { name: "Week 2", retention: 75 },
  { name: "Week 3", retention: 60 },
  { name: "Week 4", retention: 50 },
  { name: "Week 5", retention: 45 },
  { name: "Week 6", retention: 40 },
  { name: "Week 7", retention: 38 },
  { name: "Week 8", retention: 35 },
];

export const customerSegmentation = [
  { subject: "Engagement", A: 120, B: 110, fullMark: 150 },
  { subject: "Loyalty", A: 98, B: 130, fullMark: 150 },
  { subject: "Satisfaction", A: 86, B: 130, fullMark: 150 },
  { subject: "Spend", A: 99, B: 100, fullMark: 150 },
  { subject: "Frequency", A: 85, B: 90, fullMark: 150 },
  { subject: "Recency", A: 65, B: 85, fullMark: 150 },
];

export const analyticsInsights = [
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
      "Product category \"Electronics\" shows the highest growth potential based on recent market trends.",
  },
  {
    iconKey: "DollarSign",
    color: "text-yellow-500",
    insight:
      "Optimizing pricing strategy could potentially increase overall profit margins by 5-7%.",
  },
];
