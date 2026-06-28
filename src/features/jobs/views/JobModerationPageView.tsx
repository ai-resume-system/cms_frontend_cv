"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Building,
  Check,
  Eye,
  Loader2,
  Lock,
  MapPin,
  Search,
  X,
} from "lucide-react";

import { JobDetailModal } from "@/components/layouts/JobDetailModal";
import { BaseModal } from "@/components/ui/BaseModal";
import { Pagination } from "@/components/ui/Pagination";
import { BaseTable, type TableColumn } from "@/components/ui/BaseTable";
import { EJobStatus, EJobStatusLabels } from "@/constants/enums/job.enum";
import { showErrorToast, showSuccessToast } from "@/lib/ui/toast";
import {
  approveJob,
  closeJob,
  getManagedJobs,
  rejectJob,
} from "@/services/job.service";
import type { Job } from "@/types/job";

const LIMIT_OPTIONS = [10, 15, 20, 50, 100] as const;

type SortField = "title" | "createdAt" | "salaryMin" | "location" | "status";
type SortOrder = "ASC" | "DESC";

const getStatusBadgeConfig = (status: EJobStatus) => {
  switch (status) {
    case EJobStatus.PENDING:
      return {
        dotClass: "bg-yellow-500",
        textClass: "text-yellow-600",
        bgClass: "bg-yellow-50 border-yellow-200",
      };
    case EJobStatus.OPEN:
      return {
        dotClass: "bg-[#16a34a]",
        textClass: "text-[#16a34a]",
        bgClass: "bg-green-50 border-green-200",
      };
    case EJobStatus.CLOSED:
      return {
        dotClass: "bg-outline",
        textClass: "text-on-surface-variant",
        bgClass: "bg-surface-container-low border-outline-variant",
      };
    case EJobStatus.REJECTED:
      return {
        dotClass: "bg-error",
        textClass: "text-error",
        bgClass: "bg-red-50 border-red-200",
      };
    case EJobStatus.EXPIRED:
      return {
        dotClass: "bg-orange-500",
        textClass: "text-orange-600",
        bgClass: "bg-orange-50 border-orange-200",
      };
    default:
      return {
        dotClass: "bg-outline",
        textClass: "text-on-surface-variant",
        bgClass: "bg-surface-container-low border-outline-variant",
      };
  }
};

export function JobModerationPageView() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [debouncedLocation, setDebouncedLocation] = useState<string>("");

  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const [isLoading, setIsLoading] = useState(false);

  const [isOpenRejectModal, setIsOpenRejectModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [isOpenApproveModal, setIsOpenApproveModal] = useState(false);
  const [approveJobId, setApproveJobId] = useState<string | null>(null);

  const [isOpenCloseModal, setIsOpenCloseModal] = useState(false);
  const [closeJobId, setCloseJobId] = useState<string | null>(null);
  const [closeReason, setCloseReason] = useState("");

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [selectedJobSlug, setSelectedJobSlug] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Debounce tìm kiếm tên công việc / doanh nghiệp
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Debounce lọc địa chỉ
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedLocation(locationFilter);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [locationFilter]);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getManagedJobs({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        location: debouncedLocation,
        sortBy: sortField,
        sortOrder,
      });

      setJobs(response.data);
      setTotalItems(response.pagination?.totalItems ?? 0);
      setTotalPages(response.pagination?.totalPages ?? 0);
    } catch (error: unknown) {
      const err = error as { message?: string };
      showErrorToast(err.message || "Không thể tải danh sách tin tuyển dụng.");
      setJobs([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    limit,
    debouncedLocation,
    page,
    debouncedSearch,
    sortField,
    sortOrder,
    statusFilter,
  ]);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  const handleSort = (field: string, order: "ASC" | "DESC") => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleApproveClick = (jobId: string) => {
    setApproveJobId(jobId);
    setIsOpenApproveModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!approveJobId) {
      return;
    }

    setActionLoading(approveJobId);
    try {
      await approveJob(approveJobId);
      showSuccessToast("Duyệt tin tuyển dụng thành công!");
      setJobs((prev) =>
        prev.map((job) =>
          job.id === approveJobId ? { ...job, status: EJobStatus.OPEN } : job,
        ),
      );
      setIsOpenApproveModal(false);
      setApproveJobId(null);
    } catch (error: unknown) {
      const err = error as { message?: string };
      showErrorToast(err.message || "Duyệt tin tuyển dụng thất bại!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setRejectReason("");
    setIsOpenRejectModal(true);
  };

  const handleCloseRejectModal = () => {
    setSelectedJobId(null);
    setRejectReason("");
    setIsOpenRejectModal(false);
  };

  const handleRejectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedJobId) {
      return;
    }

    if (!rejectReason.trim()) {
      showErrorToast("Vui lòng nhập lý do từ chối bài đăng.");
      return;
    }

    setActionLoading(selectedJobId);
    try {
      await rejectJob(selectedJobId, rejectReason.trim());
      showSuccessToast("Từ chối tin tuyển dụng thành công!");
      setJobs((prev) =>
        prev.map((job) =>
          job.id === selectedJobId
            ? { ...job, status: EJobStatus.REJECTED }
            : job,
        ),
      );
      handleCloseRejectModal();
    } catch (error: unknown) {
      const err = error as { message?: string };
      showErrorToast(err.message || "Từ chối tin tuyển dụng thất bại!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseClick = (jobId: string) => {
    setCloseJobId(jobId);
    setCloseReason("");
    setIsOpenCloseModal(true);
  };

  const handleCloseSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!closeJobId) {
      return;
    }

    if (!closeReason.trim()) {
      showErrorToast("Vui lòng nhập lý do đóng tin tuyển dụng.");
      return;
    }

    setActionLoading(closeJobId);
    try {
      await closeJob(closeJobId, closeReason.trim());
      showSuccessToast("Đóng tin tuyển dụng thành công!");
      setJobs((prev) =>
        prev.map((job) =>
          job.id === closeJobId ? { ...job, status: EJobStatus.CLOSED } : job,
        ),
      );
      setIsOpenCloseModal(false);
      setCloseJobId(null);
      setCloseReason("");
    } catch (error: unknown) {
      const err = error as { message?: string };
      showErrorToast(err.message || "Đóng tin tuyển dụng thất bại!");
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

  // Cấu hình các cột cho BaseTable
  const columns: TableColumn<Job>[] = [
    {
      key: "title",
      header: "Tên công việc",
      render: (item) => (
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-on-surface sm:text-sm">
            {item.title}
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-on-surface-variant">
            <span className="rounded-full border border-primary/10 bg-primary/5 px-1.5 py-0.5 font-bold text-primary">
              {item.experienceYears} năm KN
            </span>
          </span>
        </div>
      ),
    },
    {
      key: "company",
      header: "Doanh nghiệp",
      render: (item) => (
        <div className="flex items-center gap-2 text-left">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface-container-low sm:h-7 sm:w-7">
            <Building className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
          </div>
          <span className="max-w-30 truncate font-semibold text-on-surface-variant sm:max-w-none">
            {item.company?.companyName || "Công ty ẩn danh"}
          </span>
        </div>
      ),
    },
    {
      key: "salaryMin",
      header: "Mức lương",
      sortable: true,
      render: (item) => (
        <span className="whitespace-nowrap font-bold text-[#006c49]">
          {item.salaryMin && item.salaryMax
            ? `${(item.salaryMin / 1000000).toFixed(0)}M - ${(item.salaryMax / 1000000).toFixed(0)}M`
            : "Thỏa thuận"}
        </span>
      ),
    },
    {
      key: "location",
      header: "Địa điểm",
      render: (item) => (
        <span className="flex items-center gap-1 whitespace-nowrap text-on-surface-variant">
          <MapPin className="h-3 w-3 shrink-0" />
          {item.location || "Chưa cập nhật"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (item) => {
        const badge = getStatusBadgeConfig(item.status);
        const label = EJobStatusLabels[item.status] || item.status;
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${badge.bgClass}`}
          >
            <span className={`h-2 w-2 rounded-full ${badge.dotClass}`} />
            <span className={badge.textClass}>{label}</span>
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Ngày gửi",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-on-surface-variant">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Hành động",
      align: "right",
      render: (item) => (
        <div className="flex justify-end gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              setSelectedJobSlug(item.slug);
              setDetailModalOpen(true);
            }}
            className="rounded-lg border border-outline-variant p-2 text-on-surface-variant hover:bg-surface-container-low transition-all active:scale-90 cursor-pointer"
            title="Xem chi tiết"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {item.status === EJobStatus.PENDING && (
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => handleApproveClick(item.id)}
                disabled={actionLoading === item.id}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all active:scale-95 hover:bg-secondary-container cursor-pointer sm:px-3 sm:py-2"
                title="Duyệt đăng tin"
              >
                {actionLoading === item.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Duyệt
              </button>
              <button
                onClick={() => handleOpenRejectModal(item.id)}
                disabled={actionLoading === item.id}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-error bg-transparent px-2.5 py-1.5 text-[11px] font-bold text-error transition-all active:scale-95 hover:bg-error/5 cursor-pointer sm:px-3 sm:py-2"
                title="Từ chối duyệt"
              >
                <X className="h-3.5 w-3.5" />
                Từ chối
              </button>
            </div>
          )}

          {item.status === EJobStatus.OPEN && (
            <button
              onClick={() => handleCloseClick(item.id)}
              disabled={actionLoading === item.id}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-orange-500 bg-transparent px-2.5 py-1.5 text-[11px] font-bold text-orange-600 transition-all active:scale-95 hover:bg-orange-50 cursor-pointer sm:px-3 sm:py-2"
              title="Đóng tin tuyển dụng"
            >
              {actionLoading === item.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              Đóng tin
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 text-left sm:flex-row sm:items-end sm:gap-4">
        <h2 className="font-headline text-xl font-bold text-on-surface sm:text-2xl">
          Kiểm duyệt việc làm
        </h2>
        <div className="shrink-0">
          <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 sm:px-4 sm:py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="text-left">
              <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Tổng tin tuyển dụng
              </p>
              <p className="mt-0.5 font-headline text-sm font-bold text-on-surface">
                {totalItems} bài
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Block */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-sm sm:p-4">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative w-full flex">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-transparent py-2.5 pl-10 pr-10 font-sans text-xs outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Tìm theo tên công việc, doanh nghiệp..."
              type="text"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-colors cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="flex-1 sm:w-40 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-sans text-xs font-semibold outline-none focus:border-primary cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value={EJobStatus.PENDING}>Chờ duyệt</option>
            <option value={EJobStatus.OPEN}>Đang mở</option>
            <option value={EJobStatus.CLOSED}>Đã đóng</option>
            <option value={EJobStatus.REJECTED}>Từ chối</option>
            <option value={EJobStatus.EXPIRED}>Hết hạn</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <BaseTable
          columns={columns}
          data={jobs}
          isLoading={isLoading}
          emptyMessage="Không tìm thấy tin tuyển dụng nào."
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          minWidth="min-w-[800px]"
        />

        {/* Footer Pagination */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-outline-variant px-3 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="whitespace-nowrap font-sans text-[10px] font-semibold text-on-surface-variant sm:text-xs">
              Hiển thị {jobs.length} tin tuyển dụng
            </p>
            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-sans text-[10px] font-semibold outline-none focus:border-primary sm:px-3 sm:text-xs cursor-pointer"
            >
              {LIMIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} / trang
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

      {/* Modal từ chối duyệt */}
      <BaseModal
        isOpen={isOpenRejectModal}
        onClose={handleCloseRejectModal}
        title={
          <span className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-error" />
            Từ chối tin tuyển dụng
          </span>
        }
      >
        <form
          onSubmit={handleRejectSubmit}
          className="flex flex-col gap-4 text-left"
        >
          <div className="flex flex-col gap-2">
            <label
              className="font-sans text-xs font-bold text-on-surface-variant"
              htmlFor="reject-reason"
            >
              Lý do từ chối bài đăng tuyển dụng này{" "}
              <span className="text-error">*</span>
            </label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-outline-variant bg-transparent px-4 py-2.5 font-sans text-xs outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Nhập lý do chi tiết để phản hồi lại nhà tuyển dụng..."
              required
            />
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-outline-variant pt-4">
            <button
              type="button"
              onClick={handleCloseRejectModal}
              className="rounded-lg border border-outline-variant px-4 py-2.5 font-sans text-xs font-semibold transition-colors hover:bg-surface-container-low cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={actionLoading === selectedJobId}
              className="flex items-center gap-1.5 rounded-lg bg-error px-5 py-2.5 font-sans text-xs font-semibold text-white shadow-sm transition-all active:scale-95 hover:bg-error-container hover:text-on-error-container cursor-pointer"
            >
              {actionLoading === selectedJobId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Xác nhận từ chối"
              )}
            </button>
          </div>
        </form>
      </BaseModal>

      {/* Modal xác nhận duyệt tin */}
      <BaseModal
        isOpen={isOpenApproveModal}
        onClose={() => setIsOpenApproveModal(false)}
        title="Duyệt tin tuyển dụng"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsOpenApproveModal(false)}
              className="rounded-lg border border-outline-variant px-4 py-2.5 font-sans text-xs font-semibold transition-colors hover:bg-surface-container-low cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleApproveConfirm}
              disabled={actionLoading === approveJobId}
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-5 py-2.5 font-sans text-xs font-semibold text-white shadow-sm transition-all active:scale-95 hover:bg-secondary-container cursor-pointer"
            >
              {actionLoading === approveJobId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Xác nhận duyệt
            </button>
          </>
        }
      >
        <p className="font-sans text-sm text-on-surface-variant text-left">
          Bạn có chắc chắn muốn phê duyệt bài đăng tuyển dụng này? Bài đăng sẽ
          hiển thị công khai ngay sau khi được duyệt.
        </p>
      </BaseModal>

      {/* Modal đóng tin tuyển dụng */}
      <BaseModal
        isOpen={isOpenCloseModal}
        onClose={() => setIsOpenCloseModal(false)}
        title={
          <span className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Đóng tin tuyển dụng
          </span>
        }
      >
        <form
          onSubmit={handleCloseSubmit}
          className="flex flex-col gap-4 text-left"
        >
          <div className="flex flex-col gap-2">
            <label
              className="font-sans text-xs font-bold text-on-surface-variant"
              htmlFor="close-reason"
            >
              Lý do đóng tin tuyển dụng này{" "}
              <span className="text-error">*</span>
            </label>
            <textarea
              id="close-reason"
              value={closeReason}
              onChange={(event) => setCloseReason(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-outline-variant bg-transparent px-4 py-2.5 font-sans text-xs outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Nhập lý do đóng tin tuyển dụng..."
              required
            />
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-outline-variant pt-4">
            <button
              type="button"
              onClick={() => setIsOpenCloseModal(false)}
              className="rounded-lg border border-outline-variant px-4 py-2.5 font-sans text-xs font-semibold transition-colors hover:bg-surface-container-low cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={actionLoading === closeJobId}
              className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-5 py-2.5 font-sans text-xs font-semibold text-white shadow-sm transition-all active:scale-95 hover:bg-orange-600 cursor-pointer"
            >
              {actionLoading === closeJobId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Xác nhận đóng tin"
              )}
            </button>
          </div>
        </form>
      </BaseModal>

      {/* Modal chi tiết công việc */}
      <JobDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedJobSlug(null);
        }}
        slug={selectedJobSlug}
      />
    </div>
  );
}
