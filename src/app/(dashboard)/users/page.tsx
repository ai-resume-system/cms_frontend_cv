"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/api-service";
import { API_ENDPOINTS } from "@/constants/api";
import { User } from "@/types/user";
import { EUserRole, EUserStatus } from "@/constants/enums/user.enum";
import { toast } from "react-toastify";
import { Pagination } from "@/components/ui/Pagination";
import {
  Search,
  Users as UsersIcon,
  Lock,
  LockOpen,
  Loader2,
  Filter,
} from "lucide-react";

const LIMIT_OPTIONS = [10, 15, 20, 50, 100] as const;

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { q: search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await apiService.get<{
        data: User[];
        pagination: { totalItems: number; totalPages: number };
      }>(`${API_ENDPOINTS.USERS.LIST}?${queryParams.toString()}`, { auth: true });

      const res = response as unknown as {
        data: User[];
        pagination: { totalItems: number; totalPages: number };
      };

      if (res && res.data) {
        setUsers(res.data);
        setTotalItems(res.pagination.totalItems);
        setTotalPages(res.pagination.totalPages);
      } else {
        setUsers([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Không thể tải danh sách người dùng.");
      setUsers([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

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

  const handleToggleStatus = async (userId: string, currentStatus: EUserStatus) => {
    const newStatus = currentStatus === EUserStatus.Active ? EUserStatus.Locked : EUserStatus.Active;
    setActionLoading(userId);
    try {
      await apiService.patch(API_ENDPOINTS.USERS.UPDATE_STATUS(userId), { status: newStatus }, { auth: true });
      toast.success(
        newStatus === EUserStatus.Active
          ? "Mở khóa tài khoản người dùng thành công!"
          : "Khóa tài khoản người dùng thành công!"
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Thay đổi trạng thái tài khoản thất bại!");
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleLabel = (role: EUserRole) => {
    switch (role) {
      case EUserRole.Admin: return "Quản trị viên";
      case EUserRole.JobSeeker: return "Người tìm việc";
      case EUserRole.Recruiter: return "Nhà tuyển dụng";
      default: return role;
    }
  };

  const getStatusConfig = (status: EUserStatus) => {
    switch (status) {
      case EUserStatus.Active:
        return { label: "Hoạt động", dotClass: "bg-[#16a34a]", textClass: "text-[#16a34a]" };
      case EUserStatus.Unverified:
        return { label: "Chưa xác thực", dotClass: "bg-outline", textClass: "text-on-surface-variant" };
      case EUserStatus.Locked:
        return { label: "Đã khóa", dotClass: "bg-error", textClass: "text-error" };
      default:
        return { label: status, dotClass: "bg-outline", textClass: "text-on-surface-variant" };
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header Section */}
      <div className="text-left">
        <h1 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">Quản lý người dùng</h1>
        <p className="text-on-surface-variant font-sans text-xs mt-1">
          Giám sát, phân quyền và quản lý trạng thái tài khoản trên toàn hệ thống.
        </p>
      </div>

      {/* Filters & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <form onSubmit={handleSearchSubmit} className="lg:col-span-3 bg-surface-container-lowest rounded-xl border border-outline-variant p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <div className="relative w-full sm:flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant bg-transparent font-sans text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline"
                  placeholder="Tìm theo email hoặc số điện thoại..."
                  type="text"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors active:scale-95 shrink-0"
              >
                <Filter className="w-4 h-4 text-on-surface" />
                <span className="font-sans text-xs font-semibold text-on-surface sm:inline hidden">Tìm kiếm</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="flex-1 sm:flex-none sm:w-44 md:w-48 px-3 sm:px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-sans text-xs font-semibold focus:border-primary outline-none"
              >
                <option value="">Tất cả vai trò</option>
                <option value={EUserRole.JobSeeker}>Người tìm việc</option>
                <option value={EUserRole.Recruiter}>Nhà tuyển dụng</option>
                <option value={EUserRole.Admin}>Quản trị viên</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="flex-1 sm:flex-none sm:w-44 md:w-48 px-3 sm:px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-sans text-xs font-semibold focus:border-primary outline-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value={EUserStatus.Active}>Hoạt động</option>
                <option value={EUserStatus.Unverified}>Chưa xác thực</option>
                <option value={EUserStatus.Locked}>Đã khóa</option>
              </select>
            </div>
          </div>
        </form>

        <div className="bg-primary text-white rounded-xl p-4 shadow-sm flex flex-col justify-center overflow-hidden relative min-h-[80px] sm:min-h-[92px]">
          <div className="relative z-10 text-left">
            <p className="font-sans text-[10px] sm:text-xs font-semibold opacity-80 uppercase tracking-wider">Tổng người dùng</p>
            <h3 className="font-headline text-2xl sm:text-3xl font-extrabold mt-1">{totalItems}</h3>
          </div>
          <UsersIcon className="absolute -right-4 -bottom-4 text-white/10 w-20 sm:w-28 h-20 sm:h-28 pointer-events-none" />
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 sm:py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 sm:w-8 h-7 sm:h-8 text-primary animate-spin" />
              <p className="font-sans text-xs text-on-surface-variant font-medium">Đang tải danh sách người dùng...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-sans text-[10px] sm:text-xs font-bold border-b border-outline-variant">
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider">Người dùng</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider">Email</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider">Vai trò</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider">Trạng thái</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-on-surface font-sans text-xs">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 font-medium text-on-surface-variant">
                      Không tìm thấy người dùng phù hợp.
                    </td>
                  </tr>
                ) : (
                  users.map((item, index) => {
                    const statusConfig = getStatusConfig(item.status);
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-outline-variant/30 hover:bg-surface-container-low/50 transition-colors ${
                          index % 2 === 1 ? "bg-surface-container-low/20" : ""
                        }`}
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full border border-outline-variant flex items-center justify-center font-bold text-primary text-xs sm:text-sm shrink-0">
                              {item.profile?.fullName?.charAt(0) || "U"}
                            </div>
                            <div className="text-left min-w-0">
                              <p className="font-bold text-on-surface truncate">{item.profile?.fullName || "Chưa cập nhật tên"}</p>
                              <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5 truncate">ID: #{item.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium truncate max-w-[200px]">{item.email}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                            item.role === EUserRole.Admin
                              ? "bg-error/10 text-error border-error/20"
                              : item.role === EUserRole.Recruiter
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-secondary/10 text-secondary border-secondary/20"
                          }`}>
                            {getRoleLabel(item.role)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${statusConfig.dotClass}`}></span>
                            <span className={`font-semibold whitespace-nowrap ${statusConfig.textClass}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleToggleStatus(item.id, item.status)}
                              disabled={actionLoading === item.id || item.status === EUserStatus.Unverified}
                              className={`p-2 rounded-lg border transition-all active:scale-90 disabled:opacity-50 ${
                                item.status === EUserStatus.Locked
                                  ? "text-error border-error/20 hover:bg-error/5"
                                  : item.status === EUserStatus.Active
                                  ? "text-[#16a34a] border-[#16a34a]/20 hover:bg-[#16a34a]/5"
                                  : "text-on-surface-variant border-outline-variant"
                              }`}
                              title={
                                item.status === EUserStatus.Active ? "Khóa tài khoản"
                                  : item.status === EUserStatus.Locked ? "Mở khóa tài khoản"
                                  : "Chưa xác thực"
                              }
                            >
                              {actionLoading === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : item.status === EUserStatus.Locked ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <LockOpen className="w-4 h-4" />
                              )}
                            </button>
                          </div>
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
              Hiển thị {users.length} người dùng
            </p>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-2 sm:px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-sans text-[10px] sm:text-xs font-semibold focus:border-primary outline-none"
            >
              {LIMIT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt} / trang</option>
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
    </div>
  );
}
