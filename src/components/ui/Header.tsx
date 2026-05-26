"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useSidebarStore } from "@/features/sidebar/store/sidebarStore";
import {
  Bell,
  Shield,
  ChevronDown,
  LogOut,
  KeyRound,
  X,
  Loader2,
  Eye,
  EyeOff,
  Menu,
} from "lucide-react";
import { toast } from "react-toastify";
import { apiService } from "@/services/api-service";
import { API_ENDPOINTS } from "@/constants/api";

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
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
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
      // Tiến hành logout cục bộ dù API có lỗi
    } finally {
      clearAuth();
      window.location.href = "/login";
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const err = error as { message?: string };
      toast.error(err.message || "Đổi mật khẩu thất bại.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <header
        className={`
          h-14 sm:h-16 fixed right-0 top-0
          bg-surface-container-lowest border-b border-outline-variant
          flex items-center justify-between
          px-3 sm:px-4 md:px-6 lg:px-8
          z-40 transition-all duration-300

          /* Mobile: full width */
          w-full

          /* Desktop: trừ sidebar */
          ${isCollapsed ? "lg:w-[calc(100%-72px)]" : "lg:w-[calc(100%-256px)]"}
        `}
      >
        {/* Left: Toggle */}
        <div className="flex items-center flex-1 min-w-0">
          <button
            onClick={toggleSidebar}
            className="py-2 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant active:scale-95 shrink-0"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
          {/* Notifications */}
          <button className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-surface-container-low hover:bg-surface-container-high rounded-full transition-colors active:scale-95">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-on-surface" />
            <span className="absolute top-1.5 right-2 sm:top-2 sm:right-2.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary border-2 border-surface-container-lowest rounded-full"></span>
          </button>

          {/* Divider - ẩn trên mobile */}
          <div className="hidden md:block w-px h-8 bg-outline-variant"></div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-outline-variant font-headline text-sm sm:text-[15px] font-bold shrink-0">
                A
              </div>
              {/* Thông tin user - ẩn trên mobile */}
              <div className="hidden md:flex flex-col text-left">
                <span className="font-sans text-xs font-bold text-on-surface leading-none">
                  {user?.email || "Tài khoản quản trị"}
                </span>
                <span className="font-sans text-[10px] font-medium text-on-surface-variant leading-none mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-primary" /> Quản trị viên hệ
                  thống
                </span>
              </div>
              <ChevronDown
                className={`hidden sm:block w-4 h-4 text-on-surface-variant transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 sm:w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
                {/* Hiện email trên mobile trong dropdown */}
                <div className="md:hidden px-4 py-3 border-b border-outline-variant">
                  <p className="font-sans text-xs font-bold text-on-surface truncate">
                    {user?.email || "Tài khoản quản trị"}
                  </p>
                  <p className="font-sans text-[10px] text-on-surface-variant mt-0.5">
                    Quản trị viên hệ thống
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setPasswordModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-container-low transition-colors font-sans text-xs font-semibold text-left"
                >
                  <KeyRound className="w-4 h-4 text-on-surface-variant" />
                  Đổi mật khẩu
                </button>
                <div className="h-px bg-outline-variant" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error/5 transition-colors font-sans text-xs font-semibold text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
              <h3 className="font-headline text-sm sm:text-md font-bold text-on-surface">
                Đổi mật khẩu
              </h3>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="p-4 sm:p-6 flex flex-col gap-4 text-left"
            >
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-bold text-on-surface-variant">
                  Mật khẩu hiện tại <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 sm:px-4 py-2.5 pr-10 rounded-lg border border-outline-variant bg-transparent font-sans text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant p-1"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
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
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 sm:px-4 py-2.5 pr-10 rounded-lg border border-outline-variant bg-transparent font-sans text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant p-1"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-bold text-on-surface-variant">
                  Xác nhận mật khẩu mới <span className="text-error">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-outline-variant bg-transparent font-sans text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-3 sm:px-4 py-2.5 rounded-lg border border-outline-variant hover:bg-surface-container-low font-sans text-xs font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 sm:px-5 py-2.5 bg-primary hover:bg-primary-container text-white rounded-lg font-sans text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {passwordLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
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
