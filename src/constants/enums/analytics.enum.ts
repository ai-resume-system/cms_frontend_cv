export enum EAnalyticsRange {
  SEVEN_DAYS = "7d",
  THIRTY_DAYS = "30d",
  NINETY_DAYS = "90d",
  ONE_YEAR = "1y",
}

export const ANALYTICS_RANGE_LABELS: Record<EAnalyticsRange, string> = {
  [EAnalyticsRange.SEVEN_DAYS]: "7 ngày gần nhất",
  [EAnalyticsRange.THIRTY_DAYS]: "30 ngày gần nhất",
  [EAnalyticsRange.NINETY_DAYS]: "90 ngày gần nhất",
  [EAnalyticsRange.ONE_YEAR]: "1 năm gần nhất",
};

export const ANALYTICS_RANGE_BUTTON_LABELS: Record<EAnalyticsRange, string> = {
  [EAnalyticsRange.SEVEN_DAYS]: "7 Ngày",
  [EAnalyticsRange.THIRTY_DAYS]: "30 Ngày",
  [EAnalyticsRange.NINETY_DAYS]: "90 Ngày",
  [EAnalyticsRange.ONE_YEAR]: "1 Năm",
};

export const ANALYTICS_RANGE_OPTIONS = [
  EAnalyticsRange.SEVEN_DAYS,
  EAnalyticsRange.THIRTY_DAYS,
  EAnalyticsRange.NINETY_DAYS,
  EAnalyticsRange.ONE_YEAR,
] as const;
