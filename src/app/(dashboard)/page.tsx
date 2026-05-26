"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { apiService } from "@/services/api-service";
import { API_ENDPOINTS } from "@/constants/api";
import {
  Users as UsersIcon,
  Briefcase,
  // CheckCircle2,
  // Eye,
  // TrendingUp,
  // TrendingDown,
  MoreVertical,
  UserPlus,
  FilePlus,
  AlertCircle,
  Download,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalJobs, setTotalJobs] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const date = new Date();
    setCurrentTime(
      date.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [usersRes, jobsRes] = await Promise.all([
        apiService.get<{
          data: unknown[];
          pagination: { totalItems: number };
        }>(`${API_ENDPOINTS.USERS.LIST}?page=1&limit=1`, { auth: true }),
        apiService.get<{
          data: unknown[];
          pagination: { totalItems: number };
        }>(`${API_ENDPOINTS.JOBS.LIST_ADMIN}?page=1&limit=1`, { auth: true }),
      ]);

      const users = usersRes as unknown as { pagination: { totalItems: number } };
      const jobs = jobsRes as unknown as { pagination: { totalItems: number } };

      setTotalUsers(users.pagination?.totalItems ?? 0);
      setTotalJobs(jobs.pagination?.totalItems ?? 0);
    } catch {
      setTotalUsers(0);
      setTotalJobs(0);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatNumber = (num: number) => {
    return num.toLocaleString("vi-VN");
  };

  const logs = [
    {
      time: "14:23:05 - Hôm nay",
      userInit: "QH",
      userName: "Quốc Huy",
      action: "Cập nhật hồ sơ công ty",
      module: "Quản lý User",
      status: "Hoàn tất",
      statusColor: "bg-secondary/10 text-secondary border border-secondary/20",
    },
    {
      time: "13:45:12 - Hôm nay",
      userInit: "TT",
      userName: "Thanh Tâm",
      action: "Duyệt bài đăng tuyển AI Engineer",
      module: "Kiểm duyệt",
      status: "Hoàn tất",
      statusColor: "bg-secondary/10 text-secondary border border-secondary/20",
    },
    {
      time: "12:10:00 - Hôm nay",
      userInit: "HT",
      userName: "Hệ thống",
      action: "Sao lưu cơ sở dữ liệu FUSE",
      module: "Bảo trì",
      status: "Hoàn tất",
      statusColor: "bg-secondary/10 text-secondary border border-secondary/20",
    },
    {
      time: "11:55:40 - Hôm nay",
      userInit: "MN",
      userName: "Minh Nhật",
      action: "Khóa tài khoản vi phạm spam",
      module: "Bảo mật",
      status: "Đã đóng",
      statusColor: "bg-on-surface-variant/10 text-on-surface-variant border border-outline-variant",
    },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header Section */}
      <section className="flex flex-col gap-1.5 text-left">
        <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">Tổng quan hệ thống</h2>
        <p className="font-sans text-xs text-on-surface-variant">
          Chào mừng trở lại, <span className="font-bold text-primary">{user?.email}</span>.{" "}
          {currentTime ? `Hôm nay là ${currentTime}.` : "Dưới đây là phân tích hiệu suất mới nhất cho nền tảng FUSE."}
        </p>
      </section>

      {/* KPI Grid */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* KPI 1 - Tổng người dùng (API thật) */}
        <div className="bg-surface-container-lowest border border-outline-variant p-4 sm:p-6 rounded-xl flex flex-col gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="bg-primary/10 p-2 sm:p-2.5 rounded-lg text-primary">
              <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div>
            <p className="font-sans text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tổng người dùng</p>
            {statsLoading ? (
              <div className="mt-2">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : (
              <p className="font-headline text-xl sm:text-2xl md:text-3xl font-extrabold text-on-surface mt-1">
                {formatNumber(totalUsers ?? 0)}
              </p>
            )}
          </div>
        </div>

        {/* KPI 2 - Tin tuyển dụng (API thật) */}
        <div className="bg-surface-container-lowest border border-outline-variant p-4 sm:p-6 rounded-xl flex flex-col gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="bg-primary/10 p-2 sm:p-2.5 rounded-lg text-primary">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div>
            <p className="font-sans text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tin tuyển dụng</p>
            {statsLoading ? (
              <div className="mt-2">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : (
              <p className="font-headline text-xl sm:text-2xl md:text-3xl font-extrabold text-on-surface mt-1">
                {formatNumber(totalJobs ?? 0)}
              </p>
            )}
          </div>
        </div>

        {/* KPI 3 - Tỷ lệ khớp AI (chưa có API, tạm ẩn) */}
        {/* <div className="bg-surface-container-lowest border border-outline-variant p-4 sm:p-6 rounded-xl flex flex-col gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="bg-primary/10 p-2 sm:p-2.5 rounded-lg text-primary">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="flex items-center text-secondary font-semibold text-[10px] sm:text-xs bg-secondary/10 border border-secondary/20 px-1.5 sm:px-2 py-0.5 rounded-full">
              Tốt nhất
            </span>
          </div>
          <div>
            <p className="font-sans text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tỷ lệ khớp AI</p>
            <p className="font-headline text-xl sm:text-2xl md:text-3xl font-extrabold text-on-surface mt-1">94.2%</p>
          </div>
        </div> */}

        {/* KPI 4 - Lượt xem CV (chưa có API, tạm ẩn) */}
        {/* <div className="bg-surface-container-lowest border border-outline-variant p-4 sm:p-6 rounded-xl flex flex-col gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="bg-primary/10 p-2 sm:p-2.5 rounded-lg text-primary">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="flex items-center text-error font-semibold text-[10px] sm:text-xs bg-error/10 border border-error/20 px-1.5 sm:px-2 py-0.5 rounded-full">
              <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1" />
              -2.1%
            </span>
          </div>
          <div>
            <p className="font-sans text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Lượt xem CV</p>
            <p className="font-headline text-xl sm:text-2xl md:text-3xl font-extrabold text-on-surface mt-1">45.2k</p>
          </div>
        </div> */}
      </section>

      {/* Bento Grid - Charts & Activities */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface">Xu hướng tăng trưởng người dùng</h3>
            <div className="flex bg-surface-container-low rounded-lg p-1">
              <button className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold bg-white rounded shadow-sm text-primary">7 ngày</button>
              <button className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-on-surface-variant hover:text-on-surface">30 ngày</button>
            </div>
          </div>

          {/* Simulated Line Chart */}
          <div className="h-40 sm:h-52 md:h-64 w-full relative flex items-end gap-1 sm:gap-2 px-1 sm:px-2 pt-10">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-outline-variant/30 w-full h-0"></div>
              <div className="border-t border-outline-variant/30 w-full h-0"></div>
              <div className="border-t border-outline-variant/30 w-full h-0"></div>
              <div className="border-t border-outline-variant/30 w-full h-0"></div>
            </div>

            <div className="flex-1 bg-primary/20 rounded-t-sm h-[40%] group cursor-pointer hover:bg-primary/40 transition-colors"></div>
            <div className="flex-1 bg-primary/20 rounded-t-sm h-[55%] group cursor-pointer hover:bg-primary/40 transition-colors"></div>
            <div className="flex-1 bg-primary/20 rounded-t-sm h-[45%] group cursor-pointer hover:bg-primary/40 transition-colors"></div>
            <div className="flex-1 bg-primary/20 rounded-t-sm h-[70%] group cursor-pointer hover:bg-primary/40 transition-colors"></div>
            <div className="flex-1 bg-primary/20 rounded-t-sm h-[65%] group cursor-pointer hover:bg-primary/40 transition-colors"></div>
            <div className="flex-1 bg-primary/20 rounded-t-sm h-[85%] group cursor-pointer hover:bg-primary/40 transition-colors"></div>
            <div className="flex-1 bg-primary rounded-t-sm h-[95%] relative group cursor-pointer hover:bg-primary/80 transition-colors">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md">
                Hôm nay: +420
              </div>
            </div>
          </div>
          <div className="flex justify-between px-1 sm:px-2 text-[10px] sm:text-xs font-semibold text-on-surface-variant">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span>CN</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface">Hoạt động gần đây</h3>
            <MoreVertical className="w-5 h-5 text-on-surface-variant cursor-pointer" />
          </div>
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex gap-3 sm:gap-4 items-start">
              <div className="bg-secondary/10 text-secondary p-2 sm:p-2.5 rounded-full shrink-0">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-sans text-xs font-bold text-on-surface">Người dùng mới đăng ký</p>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5 truncate">Nguyễn Văn An vừa tham gia FUSE.</p>
                <p className="font-sans text-[10px] text-outline mt-1.5">2 phút trước</p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 items-start">
              <div className="bg-primary/10 text-primary p-2 sm:p-2.5 rounded-full shrink-0">
                <FilePlus className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-sans text-xs font-bold text-on-surface">Việc làm mới đăng tuyển</p>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5 truncate">Tuyển dụng Senior AI Engineer tại VNG.</p>
                <p className="font-sans text-[10px] text-outline mt-1.5">15 phút trước</p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 items-start">
              <div className="bg-error/10 text-error p-2 sm:p-2.5 rounded-full shrink-0">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-sans text-xs font-bold text-on-surface">Cảnh báo bảo mật</p>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5 truncate">Phát hiện đăng nhập bất thường từ IP lạ.</p>
                <p className="font-sans text-[10px] text-outline mt-1.5">1 giờ trước</p>
              </div>
            </div>
          </div>
          <button className="mt-auto w-full py-2.5 border border-primary text-primary font-sans text-xs font-semibold rounded-lg hover:bg-primary/5 transition-colors active:scale-[0.98]">
            Xem tất cả hoạt động
          </button>
        </div>
      </section>

      {/* System Activity Table */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface">Nhật ký hệ thống chi tiết</h3>
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary text-white rounded-lg font-sans text-xs font-semibold hover:bg-primary-container active:scale-95 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-sans text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Thời gian</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-sans text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Người thực hiện</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-sans text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Hành động</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-sans text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Mô-đun</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-sans text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {logs.map((log, index) => (
                <tr key={index} className="hover:bg-surface-container-low transition-colors duration-150">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-sans text-xs font-semibold text-on-surface whitespace-nowrap">{log.time}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px] sm:text-xs shrink-0">
                      {log.userInit}
                    </div>
                    <span className="font-sans text-xs font-bold text-on-surface">{log.userName}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-sans text-xs text-on-surface">{log.action}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-sans text-xs text-on-surface-variant">{log.module}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`px-2 sm:px-2.5 py-1 text-[10px] font-bold uppercase rounded-md whitespace-nowrap ${log.statusColor}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
