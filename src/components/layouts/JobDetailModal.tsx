"use client";

import {
  AlertCircle,
  Box,
  Briefcase,
  Building,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Users,
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
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeConfig = (status?: EJobStatus) => {
    if (!status) return { bgClass: "", textClass: "", dotClass: "" };
    switch (status) {
      case EJobStatus.PENDING:
        return {
          dotClass: "bg-yellow-505",
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
          dotClass: "bg-orange-505",
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

  const companyName =
    job?.company?.name || job?.company?.companyName || "Doanh nghiệp ẩn danh";
  const websiteUrl = job?.company?.websiteUrl;
  const taxCode = job?.company?.taxCode || "Chưa cập nhật";
  const companyAddress =
    job?.company?.location || job?.company?.address || "Chưa cập nhật";

  const buildMapLink = () => {
    if (!job?.company) return undefined;
    if (
      typeof job.company.latitude === "number" &&
      typeof job.company.longitude === "number"
    ) {
      return `https://www.google.com/maps?q=${job.company.latitude},${job.company.longitude}`;
    }
    const addr = job.company.location || job.company.address;
    if (addr && addr !== "Chưa cập nhật") {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    }
    return undefined;
  };

  const buildGoogleMapsUrl = () => {
    if (!job?.company) return undefined;
    const lat = job.company.latitude;
    const lng = job.company.longitude;

    if (typeof lat === "number" && typeof lng === "number") {
      return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    }
    const addr = job.company.location || job.company.address;
    if (addr && addr !== "Chưa cập nhật") {
      return `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&z=15&output=embed`;
    }
    return undefined;
  };

  const mapsUrl = buildGoogleMapsUrl();
  const mapLink = buildMapLink();

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-[28px] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/15 shrink-0 bg-white">
          <div>
            <h2 className="text-lg font-bold text-on-surface">
              Chi tiết bài đăng tuyển dụng
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Xem chi tiết nội dung, thông tin doanh nghiệp và trạng thái kiểm
              duyệt của bài tuyển dụng.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-on-surface-variant transition hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/50 text-left">
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
              <p className="font-sans text-xs font-semibold text-on-surface-variant">
                Đang tải dữ liệu chi tiết công việc...
              </p>
            </div>
          ) : !job ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-20 gap-3">
              <AlertCircle className="h-10 w-10 text-error" />
              <p className="font-sans text-sm font-bold text-error">
                Không thể tải thông tin bài đăng tuyển dụng. Vui lòng thử lại
                sau.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
              {/* Cột trái (2/3 chiều rộng) */}
              <div className="space-y-6 lg:col-span-2">
                {/* Tin tuyển dụng chung */}
                <section className="rounded-3xl border border-outline-variant/80 bg-white p-6 sm:p-8 shadow-xs">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
                    {job.title}
                  </h1>

                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-primary/10 bg-primary/5 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                      Yêu cầu {job.experienceYears} năm kinh nghiệm
                    </span>
                    {job.careerCategory && (
                      <span className="rounded-full border border-secondary/10 bg-secondary/5 px-2.5 py-0.5 text-[10px] font-bold text-secondary">
                        {job.careerCategory.name}
                      </span>
                    )}
                  </div>

                  {/* 3 cards lưới thông tin cơ bản */}
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                      {
                        icon: DollarSign,
                        label: "Mức lương",
                        value:
                          job.salaryMin && job.salaryMax
                            ? `${(job.salaryMin / 1000000).toFixed(0)}M - ${(job.salaryMax / 1000000).toFixed(0)}M`
                            : "Thỏa thuận",
                        valueColor: "text-[#006c49]",
                      },
                      {
                        icon: MapPin,
                        label: "Địa điểm làm việc",
                        value: job.location || "Chưa cập nhật",
                        valueColor: "text-slate-800",
                      },
                      {
                        icon: Clock,
                        label: "Hạn nộp hồ sơ",
                        value: formatDate(job.expiredAt),
                        valueColor: "text-slate-800",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-4 border border-outline-variant/20"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-xs border border-outline-variant/15">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col text-left min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {item.label}
                          </span>
                          <span
                            className={`text-xs font-extrabold ${item.valueColor} wrap-break-words whitespace-pre-wrap`}
                          >
                            {item.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Lý do từ chối (nếu có) */}
                {job.status === EJobStatus.REJECTED && job.rejectReason && (
                  <section className="flex flex-col gap-2 rounded-2xl border border-red-200 bg-red-50 p-5 shadow-xs">
                    <h4 className="flex items-center gap-1.5 font-headline text-xs font-bold text-error uppercase tracking-wider">
                      <AlertCircle className="h-4 w-4" />
                      Lý do từ chối duyệt bài đăng
                    </h4>
                    <p className="font-sans text-xs font-medium leading-relaxed text-error">
                      {job.rejectReason}
                    </p>
                  </section>
                )}

                {/* Mô tả ngắn */}
                {job.shortDescription && (
                  <section className="rounded-3xl border border-outline-variant/80 bg-white p-6 sm:p-8 shadow-xs">
                    <h2 className="relative flex items-center text-sm font-bold text-primary pl-3">
                      <span className="absolute left-0 top-0 h-full w-1 rounded-full bg-primary" />
                      Mô tả tóm tắt
                    </h2>
                    <p className="mt-4 font-sans text-sm font-medium text-slate-600 leading-relaxed">
                      {job.shortDescription}
                    </p>
                  </section>
                )}

                {/* Mô tả chi tiết */}
                <section className="rounded-3xl border border-outline-variant/80 bg-white p-6 sm:p-8 shadow-xs">
                  <h2 className="relative flex items-center text-sm font-bold text-primary pl-3">
                    <span className="absolute left-0 top-0 h-full w-1 rounded-full bg-primary" />
                    Mô tả công việc chi tiết
                  </h2>
                  <div className="prose prose-sm max-w-none mt-5 text-sm leading-relaxed text-slate-600 [&>ul]:list-disc [&>ol]:list-decimal [&>ul]:ml-5 [&>ol]:ml-5 [&>h1]:text-lg [&>h1]:font-bold [&>h2]:text-md [&>h2]:font-bold [&>h3]:text-sm [&>h3]:font-bold [&_a]:text-primary [&_a]:underline">
                    <div
                      className="min-w-0 overflow-hidden"
                      dangerouslySetInnerHTML={{
                        __html: (job.description ?? "").replace(/&nbsp;/g, " "),
                      }}
                    />
                  </div>
                </section>
              </div>

              {/* Cột phải (1/3 chiều rộng) */}
              <aside className="space-y-6">
                {/* Doanh nghiệp Profile Card */}
                {job.company && (
                  <section className="border border-outline-variant/80 bg-white rounded-3xl overflow-hidden shadow-xs">
                    {job.company.bannerUrl ? (
                      <img
                        src={job.company.bannerUrl}
                        className="h-24 w-full object-cover"
                        alt="Company Banner"
                      />
                    ) : (
                      <div className="bg-linear-to-r from-primary/10 to-secondary/15 h-24 w-full relative" />
                    )}

                    <div className="px-5 pb-5 text-left">
                      <div className="h-14 w-14 rounded-2xl border-2 border-white shadow-md -mt-7 relative z-10 bg-white overflow-hidden flex items-center justify-center">
                        {job.company.logoUrl ? (
                          <img
                            src={job.company.logoUrl}
                            className="h-full w-full object-cover"
                            alt={companyName}
                          />
                        ) : (
                          <Building className="h-6 w-6 text-primary" />
                        )}
                      </div>

                      <h2 className="font-extrabold text-sm text-slate-800 mt-2 wrap-wrap-break-words">
                        {companyName}
                      </h2>

                      <div className="mt-3.5 space-y-2.5 text-xs">
                        <p className="flex items-start gap-2 text-slate-600">
                          <Box className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="font-bold shrink-0 text-slate-500">
                            Lĩnh vực:
                          </span>
                          <span className="font-semibold text-primary wrap-break-words">
                            {job.careerCategory?.name ?? "Chưa cập nhật"}
                          </span>
                        </p>
                        {websiteUrl && (
                          <p className="flex items-start gap-2 text-slate-600">
                            <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="font-bold shrink-0 text-slate-500">
                              Website:
                            </span>
                            <a
                              href={websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-primary hover:underline break-all"
                            >
                              {websiteUrl}
                            </a>
                          </p>
                        )}
                        <p className="flex items-start gap-2 text-slate-600">
                          <Building className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="font-bold shrink-0 text-slate-500">
                            Mã số thuế:
                          </span>
                          <span className="font-semibold text-slate-700 wrap-break-words">
                            {taxCode}
                          </span>
                        </p>
                        <p className="flex items-start gap-2 text-slate-600">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="font-bold shrink-0 text-slate-500">
                            Địa chỉ:
                          </span>
                          <span className="font-semibold text-slate-700 wrap-break-words whitespace-pre-wrap">
                            {companyAddress}
                          </span>
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Trạng thái & Mốc thời gian */}
                <section className="border border-outline-variant/80 bg-white p-5 shadow-xs rounded-3xl text-left">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3.5">
                    Trạng thái & Thời gian
                  </h3>
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-400">
                        Trạng thái duyệt:
                      </span>
                      {(() => {
                        const badge = getStatusBadgeConfig(job.status);
                        const label =
                          EJobStatusLabels[job.status] || job.status;
                        return (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-bold ${badge.bgClass}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`}
                            />
                            <span className={badge.textClass}>{label}</span>
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-400">
                        Ngày đăng tuyển:
                      </span>
                      <span className="font-bold text-slate-700">
                        {formatDate(job.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-400">
                        Cập nhật cuối:
                      </span>
                      <span className="font-bold text-slate-700">
                        {formatDate(job.updatedAt)}
                      </span>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-outline-variant/15 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-outline-variant/60 bg-white hover:bg-slate-50 px-5 py-2 font-sans text-xs font-bold text-on-surface transition active:scale-95 cursor-pointer shadow-2xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
