"use client";

import {
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { EUserRole, EUserStatus } from "@/constants/enums/user.enum";
import { getUserById } from "@/services/user.service";
import type { User } from "@/types/user";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export function UserDetailModal({
  isOpen,
  onClose,
  userId,
}: UserDetailModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) {
      setUser(null);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const response = await getUserById(userId);
        setUser(response);
      } catch (error) {
        console.error("Không thể tải chi tiết người dùng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDetail();
  }, [isOpen, userId]);

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

  const getRoleBadgeClass = (role?: EUserRole) => {
    switch (role) {
      case EUserRole.ADMIN:
        return "border-error/20 bg-error/10 text-error";
      case EUserRole.RECRUITER:
        return "border-primary/20 bg-primary/10 text-primary";
      default:
        return "border-secondary/20 bg-secondary/10 text-secondary";
    }
  };

  const getRoleLabel = (role?: EUserRole) => {
    switch (role) {
      case EUserRole.ADMIN:
        return "Quản trị viên";
      case EUserRole.RECRUITER:
        return "Nhà tuyển dụng";
      default:
        return "Người tìm việc";
    }
  };

  const getStatusBadgeClass = (status?: EUserStatus) => {
    switch (status) {
      case EUserStatus.ACTIVE:
        return "border-success/20 bg-success/10 text-[#16a34a]";
      case EUserStatus.LOCKED:
        return "border-error/20 bg-error/10 text-error";
      default:
        return "border-outline-variant bg-surface-container-low text-on-surface-variant";
    }
  };

  const getStatusLabel = (status?: EUserStatus) => {
    switch (status) {
      case EUserStatus.ACTIVE:
        return "Hoạt động";
      case EUserStatus.LOCKED:
        return "Đã khóa";
      default:
        return "Chưa xác thực";
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-on-surface/40 p-3 backdrop-blur-sm sm:p-4">
      <div className="relative flex h-full max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="font-headline text-sm font-bold text-on-surface sm:text-md">
            Chi tiết tài khoản người dùng
          </h3>
          <button
            className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-sans text-xs font-semibold text-on-surface-variant">
                Đang tải dữ liệu người dùng...
              </p>
            </div>
          ) : !user ? (
            <div className="flex h-64 items-center justify-center text-center">
              <p className="font-sans text-xs font-bold text-error">
                Không thể tải thông tin người dùng. Vui lòng thử lại sau.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {user.role === EUserRole.RECRUITER ? (
                <div className="relative mb-6">
                  {/* Banner */}
                  <div className="h-28 w-full overflow-hidden rounded-lg bg-linear-to-r from-blue-500/20 to-indigo-500/20 sm:h-36">
                    {user.company?.bannerUrl ? (
                      <img
                        src={user.company.bannerUrl}
                        alt="Company Banner"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-surface-container-high font-sans text-[10px] font-bold uppercase tracking-wider text-outline">
                        Chưa cập nhật ảnh bìa công ty
                      </div>
                    )}
                  </div>

                  {/* Logo overlay */}
                  <div className="absolute -bottom-6 left-6 flex h-16 w-16 items-center justify-center rounded-lg border-2 border-surface-container-lowest bg-surface-container-lowest shadow-sm sm:h-20 sm:w-20">
                    {user.company?.logoUrl ? (
                      <img
                        src={user.company.logoUrl}
                        alt="Company Logo"
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 border-b border-outline-variant pb-5 text-left">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-primary/10 font-headline text-lg font-bold text-primary sm:h-20 sm:w-20 sm:text-xl">
                    {user.profile?.avatarUrl ? (
                      <img
                        src={user.profile.avatarUrl}
                        alt={user.profile?.fullName || "Avatar"}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      (user.profile?.fullName || "User").charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-headline text-md font-bold text-on-surface sm:text-lg">
                      {user.profile?.fullName || "Chưa cập nhật họ tên"}
                    </h4>
                    <p className="mt-1 font-sans text-xs font-semibold text-on-surface-variant">
                      Tài khoản cá nhân / Người tìm việc
                    </p>
                  </div>
                </div>
              )}

              {/* 1. Account Info Section */}
              <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-left">
                <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Thông tin tài khoản
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    <div className="min-w-0">
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Email
                      </p>
                      <p className="truncate font-sans text-xs font-bold text-on-surface">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    <div className="min-w-0">
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Số điện thoại
                      </p>
                      <p className="truncate font-sans text-xs font-bold text-on-surface">
                        {user.phone || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Shield className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    <div>
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Vai trò
                      </p>
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${getRoleBadgeClass(
                          user.role,
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    <div>
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Trạng thái
                      </p>
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(
                          user.status,
                        )}`}
                      >
                        {getStatusLabel(user.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    <div className="min-w-0">
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Ngày tạo tài khoản
                      </p>
                      <p className="truncate font-sans text-xs font-bold text-on-surface">
                        {formatDate(user.createdAt)}
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
                        {formatDate(user.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Detailed Profile Section */}
              {user.role === EUserRole.RECRUITER ? (
                <div className="flex flex-col gap-4 text-left">
                  <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Thông tin công ty
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Tên công ty
                      </p>
                      <p className="mt-0.5 font-sans text-xs font-bold text-on-surface">
                        {user.company?.name || "Chưa cập nhật tên công ty"}
                      </p>
                    </div>
                    <div>
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Mã số thuế
                      </p>
                      <p className="mt-0.5 font-sans text-xs font-bold text-on-surface">
                        {user.company?.taxCode || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Địa chỉ website
                      </p>
                      {user.company?.websiteUrl ? (
                        <a
                          href={user.company.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 font-sans text-xs font-bold text-primary hover:underline"
                        >
                          <Globe className="h-3 w-3" />
                          {user.company.websiteUrl}
                        </a>
                      ) : (
                        <p className="mt-0.5 font-sans text-xs font-bold text-on-surface-variant">
                          Chưa cập nhật
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="font-sans text-[10px] font-semibold text-outline">
                        Quy mô nhân sự
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1 font-sans text-xs font-bold text-on-surface">
                        <Users className="h-3.5 w-3.5 text-on-surface-variant" />
                        {user.company?.employeeMin !== undefined &&
                        user.company?.employeeMax !== undefined
                          ? `${user.company.employeeMin} - ${user.company.employeeMax} nhân viên`
                          : "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-sans text-[10px] font-semibold text-outline">
                      Địa chỉ văn phòng
                    </p>
                    <p className="mt-1 flex items-start gap-1 font-sans text-xs font-bold text-on-surface">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-on-surface-variant" />
                      {user.company?.address || "Chưa cập nhật"}
                    </p>
                  </div>

                  <div>
                    <p className="font-sans text-[10px] font-semibold text-outline">
                      Giới thiệu công ty
                    </p>
                    <div className="mt-1.5 rounded-lg border border-outline-variant bg-surface-container-low p-3 font-sans text-xs font-medium leading-relaxed text-on-surface">
                      {user.company?.description ? (
                        <p className="whitespace-pre-line">
                          {user.company.description}
                        </p>
                      ) : (
                        <p className="italic text-outline">
                          Chưa cập nhật thông tin giới thiệu công ty.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 text-left">
                  <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Thông tin hồ sơ cá nhân
                  </h4>
                  <div>
                    <p className="font-sans text-[10px] font-semibold text-outline">
                      Họ và tên
                    </p>
                    <p className="mt-0.5 font-sans text-xs font-bold text-on-surface">
                      {user.profile?.fullName || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <p className="font-sans text-[10px] font-semibold text-outline">
                      Giới thiệu bản thân
                    </p>
                    <div className="mt-1.5 rounded-lg border border-outline-variant bg-surface-container-low p-3 font-sans text-xs font-medium leading-relaxed text-on-surface">
                      <p className="flex gap-1.5">
                        <FileText className="h-4 w-4 shrink-0 text-on-surface-variant" />
                        {user.profile?.bio ? (
                          <span className="whitespace-pre-line">
                            {user.profile.bio}
                          </span>
                        ) : (
                          <span className="italic text-outline">
                            Chưa cập nhật thông tin giới thiệu bản thân.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
