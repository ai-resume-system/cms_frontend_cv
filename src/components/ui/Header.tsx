"use client";

import {
  Bell,
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  Menu,
  Shield,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { API_ENDPOINTS } from "@/constants/constants/api";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useSidebarStore } from "@/features/sidebar/store/sidebarStore";
import { apiService } from "@/services/api-service";

export default function Header() {
  const { user, clearAuth } = useAuthStore();
  const { isCollapsed, toggle: toggleSidebar } = useSidebarStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT, undefined, {
        auth: true,
      });
    } catch {
      // Vẫn đăng xuất cục bộ nếu API logout thất bại.
    } finally {
      clearAuth();
      window.location.href = "/login";
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    setPasswordLoading(true);
    try {
      await apiService.patch(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { auth: true },
      );
      toast.success("Đổi mật khẩu thành công!");
      setPasswordModalOpen(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Đổi mật khẩu thất bại.";
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <header
        className={`
          fixed right-0 top-0 z-40 flex h-14 w-full items-center justify-between
          border-b border-outline-variant bg-surface-container-lowest
          px-3 sm:h-16 sm:px-4 md:px-6 lg:px-8
          transition-all duration-300
          ${isCollapsed ? "lg:w-[calc(100%-72px)]" : "lg:w-[calc(100%-256px)]"}
        `}
      >
        <div className="flex min-w-0 flex-1 items-center">
          <button
            className="shrink-0 rounded-lg py-2 text-on-surface-variant transition-colors hover:bg-surface-container-low active:scale-95"
            onClick={toggleSidebar}
            title="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 flex items-center gap-2 sm:gap-4 md:gap-6">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low transition-colors hover:bg-surface-container-high active:scale-95 sm:h-10 sm:w-10">
            <Bell className="h-4 w-4 text-on-surface sm:h-5 sm:w-5" />
            <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full border-2 border-surface-container-lowest bg-primary sm:right-2.5 sm:top-2 sm:h-2.5 sm:w-2.5" />
          </button>

          <div className="hidden h-8 w-px bg-outline-variant md:block" />

          <div className="relative" ref={dropdownRef}>
            <button
              className="group flex cursor-pointer items-center gap-2 sm:gap-3"
              onClick={() => setDropdownOpen((value) => !value)}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-primary/10 font-headline text-sm font-bold text-primary sm:h-10 sm:w-10 sm:text-[15px]">
                A
              </div>
              <div className="hidden flex-col text-left md:flex">
                <span className="font-sans text-xs font-bold leading-none text-on-surface">
                  {user?.email || "Tài khoản quản trị"}
                </span>
                <span className="mt-1 flex items-center gap-1 font-sans text-[10px] font-medium leading-none text-on-surface-variant">
                  <Shield className="h-3 w-3 text-primary" /> Quản trị viên hệ
                  thống
                </span>
              </div>
              <ChevronDown
                className={`hidden h-4 w-4 text-on-surface-variant transition-transform sm:block ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg sm:w-56">
                <div className="border-b border-outline-variant px-4 py-3 md:hidden">
                  <p className="truncate font-sans text-xs font-bold text-on-surface">
                    {user?.email || "Tài khoản quản trị"}
                  </p>
                  <p className="mt-0.5 font-sans text-[10px] text-on-surface-variant">
                    Quản trị viên hệ thống
                  </p>
                </div>
                <button
                  className="w-full px-4 py-3 text-left font-sans text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
                  onClick={() => {
                    setDropdownOpen(false);
                    setPasswordModalOpen(true);
                  }}
                >
                  <span className="flex items-center gap-3">
                    <KeyRound className="h-4 w-4 text-on-surface-variant" />
                    Đổi mật khẩu
                  </span>
                </button>
                <div className="h-px bg-outline-variant" />
                <button
                  className="w-full px-4 py-3 text-left font-sans text-xs font-semibold text-error transition-colors hover:bg-error/5"
                  onClick={handleLogout}
                >
                  <span className="flex items-center gap-3">
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {passwordModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 p-3 backdrop-blur-sm sm:p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3 sm:px-6 sm:py-4">
              <h3 className="font-headline text-sm font-bold text-on-surface sm:text-md">
                Đổi mật khẩu
              </h3>
              <button
                className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
                onClick={() => setPasswordModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="flex flex-col gap-4 p-4 text-left sm:p-6"
              onSubmit={handleChangePassword}
            >
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-bold text-on-surface-variant">
                  Mật khẩu hiện tại <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-lg border border-outline-variant bg-transparent px-3 py-2.5 pr-10 font-sans text-xs outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary sm:px-4"
                    onChange={(event) =>
                      setPasswordForm((previous) => ({
                        ...previous,
                        currentPassword: event.target.value,
                      }))
                    }
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant"
                    onClick={() => setShowCurrentPassword((value) => !value)}
                    type="button"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-bold text-on-surface-variant">
                  Mật khẩu mới <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-lg border border-outline-variant bg-transparent px-3 py-2.5 pr-10 font-sans text-xs outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary sm:px-4"
                    onChange={(event) =>
                      setPasswordForm((previous) => ({
                        ...previous,
                        newPassword: event.target.value,
                      }))
                    }
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    required
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant"
                    onClick={() => setShowNewPassword((value) => !value)}
                    type="button"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-bold text-on-surface-variant">
                  Xác nhận mật khẩu mới <span className="text-error">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-outline-variant bg-transparent px-3 py-2.5 font-sans text-xs outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary sm:px-4"
                  onChange={(event) =>
                    setPasswordForm((previous) => ({
                      ...previous,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  type="password"
                  value={passwordForm.confirmPassword}
                />
              </div>

              <div className="mt-3 flex justify-end gap-2 border-t border-outline-variant pt-3 sm:mt-4 sm:gap-3 sm:pt-4">
                <button
                  className="rounded-lg border border-outline-variant px-3 py-2.5 font-sans text-xs font-semibold transition-colors hover:bg-surface-container-low sm:px-4"
                  onClick={() => setPasswordModalOpen(false)}
                  type="button"
                >
                  Hủy bỏ
                </button>
                <button
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 font-sans text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-container active:scale-95 sm:px-5"
                  disabled={passwordLoading}
                  type="submit"
                >
                  {passwordLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Đổi mật khẩu"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
