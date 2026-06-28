"use client";

import {
  Eye,
  Loader2,
  Lock,
  LockOpen,
  Search,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { UserDetailModal } from "@/components/layouts/UserDetailModal";
import { BaseTable, type TableColumn } from "@/components/ui/BaseTable";
import { Pagination } from "@/components/ui/Pagination";
import {
  EUserRole,
  EUserRoleLabels,
  EUserStatus,
  EUserStatusLabels,
} from "@/constants/enums/user.enum";
import { showErrorToast, showSuccessToast } from "@/lib/ui/toast";
import { getUsers, updateUserStatus } from "@/services/user.service";
import type { User } from "@/types/user";

const LIMIT_OPTIONS = [10, 15, 20, 50, 100] as const;

export function UserManagementPageView() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Debounce tìm kiếm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUsers({
        page,
        limit,
        search: debouncedSearch,
        role: roleFilter,
        status: statusFilter,
        sortBy: sortField,
        sortOrder,
      });

      setUsers(Array.isArray(response.data) ? response.data : []);
      setTotalItems(response.pagination?.totalItems ?? 0);
      setTotalPages(response.pagination?.totalPages ?? 0);
    } catch (error: unknown) {
      const err = error as { message?: string };
      showErrorToast(err.message || "Không thể tải danh sách người dùng.");
      setUsers([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [limit, page, roleFilter, debouncedSearch, statusFilter, sortField, sortOrder]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSort = (field: string, order: "ASC" | "DESC") => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleToggleStatus = async (
    userId: string,
    currentStatus: EUserStatus,
  ) => {
    const newStatus =
      currentStatus === EUserStatus.ACTIVE
        ? EUserStatus.LOCKED
        : EUserStatus.ACTIVE;

    setActionLoading(userId);

    try {
      await updateUserStatus(userId, newStatus);
      showSuccessToast(
        newStatus === EUserStatus.ACTIVE
          ? "Mở khóa tài khoản người dùng thành công!"
          : "Khóa tài khoản người dùng thành công!",
      );
      setUsers((previous) =>
        previous.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user,
        ),
      );
    } catch (error: unknown) {
      const err = error as { message?: string };
      showErrorToast(err.message || "Thay đổi trạng thái tài khoản thất bại!");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColorConfig = (status: EUserStatus) => {
    switch (status) {
      case EUserStatus.ACTIVE:
        return {
          dotClass: "bg-[#16a34a]",
          textClass: "text-[#16a34a]",
        };
      case EUserStatus.UNVERIFIED:
        return {
          dotClass: "bg-zinc-400",
          textClass: "text-on-surface-variant",
        };
      case EUserStatus.LOCKED:
        return {
          dotClass: "bg-error",
          textClass: "text-error",
        };
      default:
        return {
          dotClass: "bg-zinc-400",
          textClass: "text-on-surface-variant",
        };
    }
  };

  // Cấu hình các cột cho BaseTable
  const columns: TableColumn<User>[] = [
    {
      key: "profile",
      header: "Người dùng",
      className: "w-[240px] sm:w-[280px]",
      render: (item) => {
        const isRecruiter = item.role === EUserRole.RECRUITER;

        const avatarUrl = isRecruiter
          ? item.company?.logoUrl || item.profile?.avatarUrl || null
          : item.profile?.avatarUrl || null;

        const displayName = isRecruiter
          ? item.company?.name ||
            item.company?.companyName ||
            item.profile?.fullName ||
            "Chưa cập nhật tên công ty"
          : item.profile?.fullName || "Chưa cập nhật tên";

        return (
          <div className="flex items-center gap-2 sm:gap-3 text-left">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-8 w-8 shrink-0 rounded-full border border-outline-variant object-cover sm:h-10 sm:w-10"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-primary/10 text-xs font-bold text-primary sm:h-10 sm:w-10 sm:text-sm">
                {displayName.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-bold text-on-surface">
                {displayName}
              </p>
              <p className="mt-0.5 truncate font-semibold text-[10px] text-on-surface-variant">
                ID: #{item.id}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "email",
      header: "Email",
      className: "w-[220px]",
      render: (item) => <span className="font-semibold">{item.email}</span>,
    },
    {
      key: "role",
      header: "Vai trò",
      className: "w-[130px]",
      render: (item) => (
        <span
          className={`whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-bold sm:px-3 ${
            item.role === EUserRole.ADMIN
              ? "border-error/20 bg-error/10 text-error"
              : item.role === EUserRole.RECRUITER
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-secondary/20 bg-secondary/10 text-secondary"
          }`}
        >
          {EUserRoleLabels[item.role] || item.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      className: "w-[140px]",
      render: (item) => {
        const config = getStatusColorConfig(item.status);
        const label = EUserStatusLabels[item.status] || item.status;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full sm:h-2.5 sm:w-2.5 ${config.dotClass}`}
            />
            <span
              className={`whitespace-nowrap font-semibold ${config.textClass}`}
            >
              {label}
            </span>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      sortable: true,
      className: "w-[170px]",
      render: (item) => (
        <span className="font-semibold text-on-surface-variant">
          {new Date(item.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      className: "w-[110px]",
      render: (item) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setSelectedUserId(item.id);
              setDetailModalOpen(true);
            }}
            className="rounded-lg border border-outline-variant p-2 text-on-surface-variant hover:bg-surface-container-low transition-all active:scale-90 cursor-pointer"
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(item.id, item.status)}
            disabled={
              actionLoading === item.id ||
              item.status === EUserStatus.UNVERIFIED
            }
            className={`rounded-lg border p-2 transition-all active:scale-90 disabled:opacity-50 cursor-pointer ${
              item.status === EUserStatus.LOCKED
                ? "border-error/20 text-error hover:bg-error/5"
                : item.status === EUserStatus.ACTIVE
                  ? "border-[#16a34a]/20 text-[#16a34a] hover:bg-[#16a34a]/5"
                  : "border-outline-variant text-on-surface-variant"
            }`}
            title={
              item.status === EUserStatus.ACTIVE
                ? "Khóa tài khoản"
                : item.status === EUserStatus.LOCKED
                  ? "Mở khóa tài khoản"
                  : "Chưa xác thực"
            }
          >
            {actionLoading === item.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : item.status === EUserStatus.LOCKED ? (
              <Lock className="h-4 w-4" />
            ) : (
              <LockOpen className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Title */}
      <div className="text-left">
        <h1 className="font-headline text-xl font-bold text-on-surface sm:text-2xl">
          Quản lý người dùng
        </h1>
      </div>

      {/* Filter Block & Summary Card */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-4 items-stretch">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-sm sm:p-4 lg:col-span-3 flex flex-col justify-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Input tìm kiếm */}
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-transparent py-2.5 pl-10 pr-10 font-sans text-xs outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Tìm theo email hoặc số điện thoại..."
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

            {/* Bộ lọc */}
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(event) => handleRoleFilterChange(event.target.value)}
                className="flex-1 sm:w-40 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-sans text-xs font-semibold outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Tất cả vai trò</option>
                <option value={EUserRole.JOB_SEEKER}>Người tìm việc</option>
                <option value={EUserRole.RECRUITER}>Nhà tuyển dụng</option>
              </select>
              <select
                value={statusFilter}
                onChange={(event) =>
                  handleStatusFilterChange(event.target.value)
                }
                className="flex-1 sm:w-40 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-sans text-xs font-semibold outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                <option value={EUserStatus.ACTIVE}>Hoạt động</option>
                <option value={EUserStatus.UNVERIFIED}>Chưa xác thực</option>
                <option value={EUserStatus.LOCKED}>Đã khóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Thẻ thống kê */}
        <div className="relative flex flex-col justify-center overflow-hidden rounded-xl bg-primary p-4 text-white shadow-sm sm:p-5">
          <div className="relative z-10 text-left">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-wider opacity-80 sm:text-xs">
              Tổng người dùng
            </p>
            <h3 className="mt-1 font-headline text-2xl font-extrabold sm:text-3xl leading-none">
              {totalItems}
            </h3>
          </div>
          <UsersIcon className="pointer-events-none absolute -bottom-4 -right-4 h-20 w-20 text-white/10 sm:h-24 sm:w-24" />
        </div>
      </div>

      {/* BaseTable Block */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <BaseTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyMessage="Không tìm thấy người dùng phù hợp."
          minWidth="min-w-[700px]"
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />

        {/* Footer Pagination */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-outline-variant px-3 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="whitespace-nowrap font-sans text-[10px] font-semibold text-on-surface-variant sm:text-xs">
              Hiển thị {users.length} người dùng
            </p>
            <select
              value={limit}
              onChange={(event) =>
                handleLimitChange(Number(event.target.value))
              }
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

      {/* Modal chi tiết người dùng */}
      <UserDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
      />
    </div>
  );
}
