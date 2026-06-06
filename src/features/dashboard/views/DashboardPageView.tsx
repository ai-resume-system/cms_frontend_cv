"use client";

import {
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Users as UsersIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuthStore } from "@/features/auth/store/authStore";
import {
  ANALYTICS_RANGE_BUTTON_LABELS,
  ANALYTICS_RANGE_LABELS,
  ANALYTICS_RANGE_OPTIONS,
  EAnalyticsRange,
} from "@/constants/enums/analytics.enum";
import {
  getAdminOverview,
  getApplicationGrowth,
  getJobGrowth,
  getRecentActivities,
  getUserGrowth,
  type AdminOverview,
  type GrowthItem,
  type RecentActivity,
} from "@/services/analytics.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function DashboardPageView() {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [growthData, setGrowthData] = useState<GrowthItem[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [activeRange, setActiveRange] = useState<EAnalyticsRange>(
    EAnalyticsRange.SEVEN_DAYS,
  );
  const [chartType, setChartType] = useState<"user" | "job" | "application">(
    "user",
  );

  const [statsLoading, setStatsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const date = new Date();
    setCurrentTime(
      date.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  const fetchOverview = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getAdminOverview();
      setOverview(data);
    } catch {
      setOverview(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchGrowth = useCallback(
    async (range: EAnalyticsRange, type: "user" | "job" | "application") => {
      setChartLoading(true);
      try {
        let data: GrowthItem[] = [];
        if (type === "user") {
          data = await getUserGrowth(range);
        } else if (type === "job") {
          data = await getJobGrowth(range);
        } else if (type === "application") {
          data = await getApplicationGrowth(range);
        }
        setGrowthData(data);
      } catch {
        setGrowthData([]);
      } finally {
        setChartLoading(false);
      }
    },
    [],
  );

  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const data = await getRecentActivities();
      setActivities(data);
    } catch {
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOverview();
    void fetchActivities();
  }, [fetchOverview, fetchActivities]);

  useEffect(() => {
    void fetchGrowth(activeRange, chartType);
  }, [activeRange, chartType, fetchGrowth]);

  const handleRangeChange = (range: EAnalyticsRange) => {
    setActiveRange(range);
  };

  const formatActivityTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return dateStr;
    }
  };

  const getRangeLabel = (range: EAnalyticsRange) => ANALYTICS_RANGE_LABELS[range];

  const formatChartAxisLabel = (value: string) => {
    if (activeRange === EAnalyticsRange.ONE_YEAR) {
      if (value.includes("-Q")) {
        const [year, quarter] = value.split("-");
        return `${quarter}/${year.slice(-2)}`;
      }

      const [year, month] = value.split("-");
      return `${month}/${year.slice(-2)}`;
    }

    const [, month, day] = value.split("-");
    return `${day}/${month}`;
  };

  const formatChartTooltipLabel = (value: string) => {
    if (activeRange === EAnalyticsRange.ONE_YEAR) {
      if (value.includes("-Q")) {
        const [year, quarter] = value.split("-");
        return `${quarter} ${year}`;
      }

      const [year, month] = value.split("-");
      return `Tháng ${month}/${year}`;
    }

    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <section className="flex flex-col gap-1.5 text-left">
        <h2 className="font-headline text-xl font-bold text-on-surface sm:text-2xl">
          Tổng quan hệ thống
        </h2>
        <p className="font-sans text-xs text-on-surface-variant">
          Chào mừng trở lại,{" "}
          <span className="font-bold text-primary">{user?.email}</span>.{" "}
          {currentTime
            ? `Hôm nay là ${currentTime}.`
            : "Dưới đây là các chỉ số mới nhất của nền tảng FUSE."}
        </p>
      </section>

      {/* Grid Stats */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
        {/* Card 1: Tổng người dùng */}
        <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:p-5">
          <div className="flex justify-between items-center">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-[10px] font-bold text-primary-container bg-primary/5 px-2 py-0.5 rounded-full">
              Hệ thống
            </span>
          </div>
          <div className="text-left">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant sm:text-xs">
              Tổng người dùng
            </p>
            {statsLoading ? (
              <div className="mt-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <p className="mt-1 font-headline text-xl font-extrabold text-on-surface sm:text-2xl">
                {overview?.totalUsers ?? 0}
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Tin tuyển dụng đang mở */}
        <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:p-5">
          <div className="flex justify-between items-center">
            <div className="rounded-lg bg-green-500/10 p-2 text-green-600">
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-[10px] font-bold text-green-700 bg-green-500/5 px-2 py-0.5 rounded-full">
              Đang tuyển
            </span>
          </div>
          <div className="text-left">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant sm:text-xs">
              Tin đang mở
            </p>
            {statsLoading ? (
              <div className="mt-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <p className="mt-1 font-headline text-xl font-extrabold text-on-surface sm:text-2xl">
                {overview?.totalOpenJobs ?? 0}
              </p>
            )}
          </div>
        </div>

        {/* Card 3: Tin chờ duyệt */}
        <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:p-5">
          <div className="flex justify-between items-center">
            <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-600">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-[10px] font-bold text-yellow-700 bg-yellow-500/5 px-2 py-0.5 rounded-full">
              Chờ duyệt
            </span>
          </div>
          <div className="text-left">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant sm:text-xs">
              Tin chờ duyệt
            </p>
            {statsLoading ? (
              <div className="mt-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <p className="mt-1 font-headline text-xl font-extrabold text-on-surface sm:text-2xl">
                {overview?.totalPendingJobs ?? 0}
              </p>
            )}
          </div>
        </div>

        {/* Card 4: Tổng lượt ứng tuyển */}
        <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:p-5">
          <div className="flex justify-between items-center">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-500/5 px-2 py-0.5 rounded-full">
              Ứng tuyển
            </span>
          </div>
          <div className="text-left">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant sm:text-xs">
              Tổng lượt ứng tuyển
            </p>
            {statsLoading ? (
              <div className="mt-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <p className="mt-1 font-headline text-xl font-extrabold text-on-surface sm:text-2xl">
                {overview?.totalApplications ?? 0}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Charts & Activities */}
      <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
        {/* User Growth Chart */}
        <div className="min-w-0 flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:gap-6 sm:p-6 lg:col-span-8">
          {/* Hàng ngang chứa Tab ở bên trái, bộ chọn thời gian ở bên phải */}
          <div className="flex flex-col gap-3 border-b border-outline-variant/60 pb-3.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Tabs chọn loại biểu đồ */}
            <div className="flex gap-5">
              {(["user", "job", "application"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`relative pb-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    chartType === type
                      ? "text-primary font-extrabold"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {type === "user"
                    ? "Người dùng"
                    : type === "job"
                      ? "Tin tuyển dụng"
                      : "Lượt ứng tuyển"}
                  {chartType === type && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in duration-200" />
                  )}
                </button>
              ))}
            </div>

            {/* Bộ chọn thời gian */}
            <div className="flex rounded-lg bg-surface-container-low p-1 gap-1 shrink-0 self-end sm:self-auto">
              {ANALYTICS_RANGE_OPTIONS.map((range) => (
                <button
                  key={range}
                  onClick={() => handleRangeChange(range)}
                  className={`rounded px-2.5 py-1 text-[10px] font-bold shadow-none transition-all sm:px-3 sm:text-xs cursor-pointer ${
                    activeRange === range
                      ? "bg-white text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {ANALYTICS_RANGE_BUTTON_LABELS[range]}
                </button>
              ))}
            </div>
          </div>

          {/* Dòng hiển thị tiêu đề phụ & chú thích */}
          <div className="text-left">
            <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {chartType === "user"
                ? "Xu hướng tăng trưởng người dùng"
                : chartType === "job"
                  ? "Xu hướng tin tuyển dụng mới"
                  : "Xu hướng lượt ứng tuyển mới"}
            </h4>
            <p className="font-sans text-[11px] text-on-surface-variant mt-0.5">
              Biểu đồ thống kê số lượng ({getRangeLabel(activeRange)})
            </p>
          </div>

          <div className="relative h-64 min-w-0 w-full sm:h-72 md:h-80">
            {chartLoading && (
              <div className="absolute inset-0 bg-surface-container-lowest/60 z-10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {isMounted ? (
              growthData.length === 0 && !chartLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="font-sans text-xs text-on-surface-variant">
                    Chưa có dữ liệu tăng trưởng trong khoảng thời gian này.
                  </p>
                </div>
              ) : (
                <div className="w-full h-full">
                  <ResponsiveContainer
                    width="99%"
                    height="100%"
                    initialDimension={{ width: 100, height: 100 }}
                  >
                    <AreaChart
                      data={growthData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorCount"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={
                              chartType === "user"
                                ? "#00288e"
                                : chartType === "job"
                                  ? "#006c49"
                                  : "#8b5cf6"
                            }
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={
                              chartType === "user"
                                ? "#00288e"
                                : chartType === "job"
                                  ? "#006c49"
                                  : "#8b5cf6"
                            }
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="date"
                        minTickGap={16}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatChartAxisLabel}
                        tick={{
                          fill: "#64748b",
                          fontSize: 10,
                          fontFamily: "sans-serif",
                        }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 10,
                          fontFamily: "sans-serif",
                        }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        formatter={(value) => [Number(value ?? 0), "Số lượng"]}
                        labelFormatter={(label) =>
                          formatChartTooltipLabel(String(label ?? ""))
                        }
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          fontFamily: "sans-serif",
                          fontSize: "12px",
                        }}
                        labelClassName="font-bold text-on-surface"
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name={
                          chartType === "user"
                            ? "Số người dùng mới"
                            : chartType === "job"
                              ? "Số tin tuyển dụng mới"
                              : "Số lượt ứng tuyển mới"
                        }
                        stroke={
                          chartType === "user"
                            ? "#00288e"
                            : chartType === "job"
                              ? "#006c49"
                              : "#8b5cf6"
                        }
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:gap-6 sm:p-6 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-base font-bold text-on-surface sm:text-lg">
              Hoạt động gần đây
            </h3>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[320px] pr-1">
            {activitiesLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="font-sans text-[11px] text-on-surface-variant">
                  Đang tải hoạt động...
                </p>
              </div>
            ) : activities.length === 0 ? (
              <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-outline-variant bg-surface-container-low/40 text-center">
                <p className="max-w-xs font-sans text-xs text-on-surface-variant px-4">
                  Chưa có hoạt động gần đây nào được ghi nhận.
                </p>
              </div>
            ) : (
              activities.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low/20 transition-all hover:bg-surface-container-low/40"
                >
                  <div className="rounded-full bg-primary/10 p-1.5 text-primary self-start shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <p className="font-sans text-xs font-semibold text-on-surface leading-tight">
                      {item.description}
                    </p>
                    <span className="mt-1 text-[10px] text-on-surface-variant font-medium">
                      {formatActivityTime(item.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
