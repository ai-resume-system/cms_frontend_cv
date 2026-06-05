"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/api-service";
import { API_ENDPOINTS } from "@/constants/constants/api";
import { Job } from "@/types/job";
import { EJobStatus } from "@/constants/enums/job.enum";
import { toast } from "react-toastify";
import { Pagination } from "@/components/ui/Pagination";
import {
  FileCheck,
  Clock,
  MapPin,
  Building,
  Check,
  X,
  Loader2,
  FileText,
  AlertCircle,
  Filter,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Briefcase,
  XCircle,
  CheckCircle,
  TimerOff,
} from "lucide-react";

const LIMIT_OPTIONS = [10, 15, 20, 50, 100] as const;

type SortField = "title" | "createdAt" | "salaryMin" | "location" | "status";
type SortOrder = "ASC" | "DESC";

const getStatusConfig = (status: EJobStatus) => {
  switch (status) {
    case EJobStatus.PENDING:
      return {
        label: "Chờ duyệt",
        dotClass: "bg-yellow-500",
        textClass: "text-yellow-600",
        bgClass: "bg-yellow-50 border-yellow-200",
      };
    case EJobStatus.OPEN:
      return {
        label: "Đang tuyển",
        dotClass: "bg-[#16a34a]",
        textClass: "text-[#16a34a]",
        bgClass: "bg-green-50 border-green-200",
      };
    case EJobStatus.CLOSED:
      return {
        label: "Đã đóng",
        dotClass: "bg-outline",
        textClass: "text-on-surface-variant",
        bgClass: "bg-surface-container-low border-outline-variant",
      };
    case EJobStatus.REJECTED:
      return {
        label: "Từ chối",
        dotClass: "bg-error",
        textClass: "text-error",
        bgClass: "bg-red-50 border-red-200",
      };
    case EJobStatus.EXPIRED:
      return {
        label: "Hết hạn",
        dotClass: "bg-orange-500",
        textClass: "text-orange-600",
        bgClass: "bg-orange-50 border-orange-200",
      };
    default:
      return {
        label: status,
        dotClass: "bg-outline",
        textClass: "text-on-surface-variant",
        bgClass: "bg-surface-container-low border-outline-variant",
      };
  }
};

export default function JobModerationPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");
  const [isLoading, setIsLoading] = useState(false);

  // State cho Modal từ chối
  const [isOPENRejectModal, setIsOPENRejectModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(locationFilter && { location: locationFilter }),
        ...(sortField && { sortBy: sortField }),
        ...(sortOrder && { sortOrder }),
      });

      const response = await apiService.get<{
        data: Job[];
        pagination: { totalItems: number; totalPages: number };
      }>(`${API_ENDPOINTS.JOBS.LIST_ADMIN}?${queryParams.toString()}`, {
        auth: true,
      });

      const res = response as unknown as {
        data: Job[];
        pagination: { totalItems: number; totalPages: number };
      };

      if (res && res.data) {
        setJobs(res.data);
        setTotalItems(res.pagination.totalItems);
        setTotalPages(res.pagination.totalPages);
      } else {
        setJobs([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Không thể tải danh sách tin tuyển dụng.");
      setJobs([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, statusFilter, locationFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortField(field);
      setSortOrder("ASC");
    }
    setPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortOrder === "ASC" ? (
      <ArrowUp className="w-3 h-3 text-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary" />
    );
  };

  const handleApprove = async (jobId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn duyệt bài đăng tuyển dụng này?"))
      return;

    setActionLoading(jobId);
    try {
      await apiService.patch(
        API_ENDPOINTS.JOBS.APPROVE(jobId),
        {},
        { auth: true },
      );
      toast.success("Duyệt tin tuyển dụng thành công!");
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId ? { ...j, status: EJobStatus.OPEN } : j,
        ),
      );
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Duyệt tin tuyển dụng thất bại!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOPENRejectModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setRejectReason("");
    setIsOPENRejectModal(true);
  };

  const handleCloseRejectModal = () => {
    setSelectedJobId(null);
    setRejectReason("");
    setIsOPENRejectModal(false);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối bài đăng.");
      return;
    }

    setActionLoading(selectedJobId);
    try {
      await apiService.patch(
        API_ENDPOINTS.JOBS.REJECT(selectedJobId),
        { rejectReason: rejectReason.trim() },
        { auth: true },
      );
      toast.success("Từ chối tin tuyển dụng thành công!");
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedJobId ? { ...j, status: EJobStatus.REJECTED } : j,
        ),
      );
      handleCloseRejectModal();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Từ chối tin tuyển dụng thất bại!");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const canModerate = (status: EJobStatus) => status === EJobStatus.PENDING;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 text-left">
        <div>
          <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
            Kiểm duyệt việc làm
          </h2>
          <p className="font-sans text-xs text-on-surface-variant mt-1">
            Quản lý, xét duyệt và theo dõi tất cả tin tuyển dụng trong hệ thống.
          </p>
        </div>
        <div className="shrink-0">
          <div className="bg-surface-container-lowest border border-outline-variant px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-left">
              <p className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Tổng tin tuyển dụng
              </p>
              <p className="font-headline text-sm sm:text-md font-bold text-on-surface mt-0.5">
                {totalItems} bài
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-3 sm:p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="relative w-full sm:flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant bg-transparent font-sans text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline"
                placeholder="Tìm theo tên công việc, doanh nghiệp..."
                type="text"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="flex-1 sm:flex-none sm:w-40 px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-sans text-xs font-semibold focus:border-primary outline-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value={EJobStatus.PENDING}>Chờ duyệt</option>
                <option value={EJobStatus.OPEN}>Đang tuyển</option>
                <option value={EJobStatus.CLOSED}>Đã đóng</option>
                <option value={EJobStatus.REJECTED}>Từ chối</option>
                <option value={EJobStatus.EXPIRED}>Hết hạn</option>
              </select>
              <input
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="flex-1 sm:flex-none sm:w-40 px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-sans text-xs font-semibold focus:border-primary outline-none placeholder:text-outline placeholder:font-normal"
                placeholder="Lọc theo địa chỉ..."
                type="text"
              />
              <button
                type="submit"
                className="flex items-center justify-center px-3 sm:px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors active:scale-95"
              >
                <Filter className="w-4 h-4 text-on-surface" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-outline-variant flex items-center justify-between">
          <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface">
            Danh sách tin tuyển dụng
          </h3>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 sm:py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 sm:w-8 h-7 sm:h-8 text-primary animate-spin" />
              <p className="font-sans text-xs text-on-surface-variant font-medium">
                Đang tải danh sách tin tuyển dụng...
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-sans text-[10px] sm:text-xs font-bold border-b border-outline-variant">
                  <th
                    className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none"
                    onClick={() => handleSort("title")}
                  >
                    <span className="flex items-center gap-1.5">
                      Tên công việc {renderSortIcon("title")}
                    </span>
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider">
                    Doanh nghiệp
                  </th>
                  <th
                    className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none"
                    onClick={() => handleSort("salaryMin")}
                  >
                    <span className="flex items-center gap-1.5">
                      Mức lương {renderSortIcon("salaryMin")}
                    </span>
                  </th>
                  <th
                    className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none"
                    onClick={() => handleSort("location")}
                  >
                    <span className="flex items-center gap-1.5">
                      Địa điểm {renderSortIcon("location")}
                    </span>
                  </th>
                  <th
                    className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none"
                    onClick={() => handleSort("status")}
                  >
                    <span className="flex items-center gap-1.5">
                      Trạng thái {renderSortIcon("status")}
                    </span>
                  </th>
                  <th
                    className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none"
                    onClick={() => handleSort("createdAt")}
                  >
                    <span className="flex items-center gap-1.5">
                      Ngày gửi {renderSortIcon("createdAt")}
                    </span>
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-sans text-xs">
                {jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-10 font-medium text-on-surface-variant"
                    >
                      Không tìm thấy tin tuyển dụng nào.
                    </td>
                  </tr>
                ) : (
                  jobs.map((item, index) => {
                    const statusConfig = getStatusConfig(item.status);
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-surface-container-low transition-colors ${
                          index % 2 === 1 ? "bg-surface-container-low/10" : ""
                        }`}
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                          <div className="flex flex-col">
                            <span className="font-bold text-on-surface text-xs sm:text-sm">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-on-surface-variant font-semibold mt-1 flex items-center gap-1.5">
                              <span className="bg-primary/5 text-primary border border-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                                {item.experienceYears} năm KN
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-surface-container-low border border-outline-variant rounded-md flex items-center justify-center shrink-0">
                              <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                            </div>
                            <span className="font-semibold text-on-surface-variant truncate max-w-[120px] sm:max-w-none">
                              {item.company?.companyName || "Công ty ẩn danh"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-[#006c49] whitespace-nowrap">
                          {item.salaryMin && item.salaryMax
                            ? `${(item.salaryMin / 1000000).toFixed(0)}M - ${(item.salaryMax / 1000000).toFixed(0)}M`
                            : "Thỏa thuận"}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-on-surface-variant">
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <MapPin className="w-3 h-3 shrink-0" />{" "}
                            {item.location}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusConfig.bgClass}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`}
                            ></span>
                            <span className={statusConfig.textClass}>
                              {statusConfig.label}
                            </span>
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-on-surface-variant whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          {canModerate(item.status) ? (
                            <div className="flex justify-end gap-1.5 sm:gap-2">
                              <button
                                onClick={() => handleApprove(item.id)}
                                disabled={actionLoading === item.id}
                                className="bg-secondary hover:bg-secondary-container text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-bold flex items-center gap-1 sm:gap-1.5 active:scale-95 transition-all shadow-sm shrink-0 text-[11px] sm:text-xs"
                                title="Duyệt đăng tin"
                              >
                                {actionLoading === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleOPENRejectModal(item.id)}
                                disabled={actionLoading === item.id}
                                className="border border-error text-error bg-transparent hover:bg-error/5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-bold flex items-center gap-1 sm:gap-1.5 active:scale-95 transition-all shrink-0 text-[11px] sm:text-xs"
                                title="Từ chối duyệt"
                              >
                                <X className="w-3.5 h-3.5" />
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-on-surface-variant text-[10px] font-medium italic">
                              {item.status === EJobStatus.OPEN && "Đã duyệt"}
                              {item.status === EJobStatus.REJECTED &&
                                "Đã từ chối"}
                              {item.status === EJobStatus.CLOSED && "Đã đóng"}
                              {item.status === EJobStatus.EXPIRED &&
                                "Đã hết hạn"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="text-on-surface-variant font-sans text-[10px] sm:text-xs font-semibold whitespace-nowrap">
              Hiển thị {jobs.length} tin tuyển dụng
            </p>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 sm:px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-sans text-[10px] sm:text-xs font-semibold focus:border-primary outline-none"
            >
              {LIMIT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Bento Grid Stats Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent logs */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 sm:p-6 md:col-span-2 text-left">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-headline text-md font-bold text-on-surface">
              Nhật ký hoạt động gần đây
            </h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 py-2.5 border-b border-outline-variant/30 last:border-0">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-xs text-on-surface font-semibold">
                  Đã phê duyệt tin tuyển dụng:{" "}
                  <strong>Data Scientist (VinGroup)</strong>
                </p>
                <p className="text-[10px] text-on-surface-variant font-medium mt-1">
                  Bởi Quản trị viên FUSE • 15 phút trước
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2.5 border-b border-outline-variant/30 last:border-0">
              <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-xs text-on-surface font-semibold">
                  Đã từ chối tin tuyển dụng:{" "}
                  <strong>Sales Manager (ABC Co.)</strong>
                </p>
                <p className="text-[10px] text-on-surface-variant font-medium mt-1">
                  Lý do: Tin tuyển dụng chứa nội dung nhạy cảm • 40 phút trước
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Banner Card */}
        <div className="bg-primary text-white border border-outline-variant rounded-xl p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden text-left min-h-[160px] sm:min-h-[200px]">
          <div className="relative z-10">
            <h4 className="font-headline text-lg font-bold mb-2">
              Báo cáo chất lượng tin
            </h4>
            <p className="font-sans text-xs text-white/80 leading-relaxed mt-2">
              Thời gian xử lý trung bình tin chờ tuyển dụng hiện tại là{" "}
              <strong>12 phút</strong>. Tuyệt vời!
            </p>
          </div>
          <button
            onClick={() =>
              toast.info("Tính năng xem báo cáo đang được triển khai")
            }
            className="px-4 py-2.5 bg-white text-primary rounded-lg font-sans text-xs font-bold hover:bg-surface-container-low transition-colors self-start z-10 active:scale-95"
          >
            Xem báo cáo chi tiết
          </button>
          <div className="absolute -right-8 -bottom-8 opacity-10 text-white select-none pointer-events-none scale-150 rotate-12">
            <FileText className="w-32 h-32" />
          </div>
        </div>
      </div>

      {/* Modal từ chối duyệt bài */}
      {isOPENRejectModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
              <h3 className="font-headline text-md font-bold text-on-surface flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-error" />
                Từ chối tin tuyển dụng
              </h3>
              <button
                onClick={handleCloseRejectModal}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleRejectSubmit}
              className="p-4 sm:p-6 flex flex-col gap-4 text-left"
            >
              <div className="flex flex-col gap-2">
                <label
                  className="font-sans text-xs font-bold text-on-surface-variant"
                  htmlFor="reject-reason"
                >
                  Lý do từ chối bài tuyển dụng này{" "}
                  <span className="text-error">*</span>
                </label>
                <textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-transparent font-sans text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  placeholder="Nhập lý do chi tiết để phản hồi lại nhà tuyển dụng (VD: Thiếu thông tin liên hệ, mức lương không hợp lý...)"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={handleCloseRejectModal}
                  className="px-4 py-2.5 rounded-lg border border-outline-variant hover:bg-surface-container-low font-sans text-xs font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === selectedJobId}
                  className="px-5 py-2.5 bg-error text-white hover:bg-error-container hover:text-on-error-container rounded-lg font-sans text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {actionLoading === selectedJobId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Xác nhận từ chối"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
