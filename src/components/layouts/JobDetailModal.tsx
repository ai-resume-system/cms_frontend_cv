"use client";

import {
  AlertCircle,
  Briefcase,
  Building,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Globe,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { EJobStatus, EJobStatusLabels } from "@/constants/enums/job.enum";
import { getManagedJobBySlug } from "@/services/job.service";
import type { Job } from "@/types/job";

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string | null;
}

export function JobDetailModal({ isOpen, onClose, slug }: JobDetailModalProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !slug) {
      setJob(null);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const response = await getManagedJobBySlug(slug);
        setJob(response);
      } catch (error) {
        console.error("Không thể tải chi tiết công việc:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDetail();
  }, [isOpen, slug]);

  if (!isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeConfig = (status?: EJobStatus) => {
    if (!status) return { bgClass: "", textClass: "", dotClass: "" };
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

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-on-surface/40 p-3 backdrop-blur-sm sm:p-4">
      <div className="relative flex h-full max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="font-headline text-sm font-bold text-on-surface sm:text-md">
            Chi tiết tin tuyển dụng
          </h3>
          <button
            className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-highest cursor-pointer"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-left">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-sans text-xs font-semibold text-on-surface-variant">
                Đang tải dữ liệu công việc...
              </p>
            </div>
          ) : !job ? (
            <div className="flex h-64 items-center justify-center text-center">
              <p className="font-sans text-xs font-bold text-error">
                Không thể tải thông tin bài đăng tuyển dụng. Vui lòng thử lại
                sau.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Job Title */}
              <div>
                <h2 className="font-headline text-md font-extrabold text-on-surface sm:text-lg">
                  {job.title}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary/10 bg-primary/5 px-2 py-0.5 text-[10px] font-bold text-primary">
                    Yêu cầu {job.experienceYears} năm kinh nghiệm
                  </span>
                </div>
              </div>

              {/* Company Info */}
              {job.company && (
                <div className="border-b border-outline-variant pb-5">
                  <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                    Thông tin doanh nghiệp tuyển dụng
                  </h4>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-low">
                      {job.company.logoUrl ? (
                        <img
                          src={job.company.logoUrl}
                          alt={job.company.companyName}
                          className="h-full w-full rounded-md object-cover"
                        />
                      ) : (
                        <Building className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-sans text-xs font-bold text-on-surface truncate">
                        {job.company.companyName}
                      </p>
                      {job.company.websiteUrl && (
                        <a
                          href={job.company.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 font-sans text-[11px] font-semibold text-primary hover:underline"
                        >
                          <Globe className="h-3 w-3" />
                          {job.company.websiteUrl}
                        </a>
                      )}
                      <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 text-[11px] text-on-surface-variant">
                        <p>
                          <span className="font-semibold text-outline">
                            Mã số thuế:
                          </span>{" "}
                          {job.company.taxCode || "Chưa cập nhật"}
                        </p>
                        {job.company.location && (
                          <p className="truncate">
                            <span className="font-semibold text-outline">
                              Địa chỉ:
                            </span>{" "}
                            {job.company.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 1. Basic Job Details */}
              <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4">
                <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Thông tin việc làm
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    <div className="min-w-0">
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Mức lương
                      </p>
                      <p className="truncate font-sans text-xs font-bold text-[#006c49]">
                        {job.salaryMin && job.salaryMax
                          ? `${(job.salaryMin / 1000000).toFixed(0)}M - ${(job.salaryMax / 1000000).toFixed(0)}M`
                          : "Thỏa thuận"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    <div className="min-w-0">
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Địa chỉ làm việc
                      </p>
                      <p className="truncate font-sans text-xs font-bold text-on-surface">
                        {job.location || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    <div className="min-w-0">
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Hạn nộp hồ sơ
                      </p>
                      <p className="truncate font-sans text-xs font-bold text-on-surface">
                        {formatDate(job.expiredAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    <div>
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Trạng thái kiểm duyệt
                      </p>
                      {(() => {
                        const badge = getStatusBadgeConfig(job.status);
                        const label =
                          EJobStatusLabels[job.status] || job.status;
                        return (
                          <span
                            className={`mt-0.5 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badge.bgClass}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`}
                            />
                            <span className={badge.textClass}>{label}</span>
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    <div className="min-w-0">
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Ngày đăng tuyển
                      </p>
                      <p className="truncate font-sans text-xs font-bold text-on-surface">
                        {formatDate(job.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    <div className="min-w-0">
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Cập nhật cuối
                      </p>
                      <p className="truncate font-sans text-xs font-bold text-on-surface">
                        {formatDate(job.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Reject Reason (if rejected) */}
              {job.status === EJobStatus.REJECTED && job.rejectReason && (
                <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
                  <h4 className="flex items-center gap-1.5 font-headline text-xs font-bold text-error uppercase tracking-wider">
                    <AlertCircle className="h-4 w-4" />
                    Lý do từ chối duyệt bài đăng
                  </h4>
                  <p className="font-sans text-xs font-medium leading-relaxed text-error">
                    {job.rejectReason}
                  </p>
                </div>
              )}

              {/* 3. Job Descriptions */}
              {job.shortDescription && (
                <div>
                  <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Mô tả ngắn
                  </h4>
                  <p className="font-sans text-xs font-medium text-on-surface-variant leading-relaxed">
                    {job.shortDescription}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Mô tả công việc chi tiết
                </h4>
                <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4 font-sans text-xs font-medium leading-relaxed text-on-surface">
                  <div className="min-w-0 overflow-hidden">
                    <div
                      className="html-content min-w-0 max-w-full"
                      dangerouslySetInnerHTML={{
                        __html: (job.description ?? "").replace(/&nbsp;/g, " "),
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-outline-variant bg-surface-container-low px-4 py-3 sm:px-6">
          <button
            className="rounded-lg border border-outline-variant bg-transparent px-4 py-2 font-sans text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high active:scale-95 cursor-pointer"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
