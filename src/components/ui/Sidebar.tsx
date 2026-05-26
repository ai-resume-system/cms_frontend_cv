"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useSidebarStore } from "@/features/sidebar/store/sidebarStore";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FolderTree,
  ShieldAlert,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import { apiService } from "@/services/api-service";
import { API_ENDPOINTS } from "@/constants/api";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const { isCollapsed, toggle, close } = useSidebarStore();

  const handleLogout = async () => {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT, undefined, {
        auth: true,
      });
    } catch {
      // Tiến hành logout cục bộ dù API có lỗi
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  const navItems = [
    { label: "Tổng quan", href: "/", icon: LayoutDashboard },
    { label: "Quản lý người dùng", href: "/users", icon: Users },
    { label: "Kiểm duyệt việc làm", href: "/jobs", icon: CheckSquare },
    { label: "Danh mục ngành nghề", href: "/categories", icon: FolderTree },
  ];

  const handleNavClick = () => {
    // Trên mobile, đóng sidebar khi chọn menu
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      close();
    }
  };

  return (
    <>
      {/* Overlay cho mobile khi sidebar mở */}
      <div
        className={`fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          !isCollapsed
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />

      <aside
        className={`
          h-screen fixed left-0 top-0 overflow-y-auto
          bg-surface-container-low border-r border-outline-variant
          flex flex-col gap-4 py-6 z-50
          transition-all duration-300

          /* Mobile: full overlay, ẩn mặc định */
          w-[280px] -translate-x-full

          /* Mobile: mở qua state */
          ${!isCollapsed ? "translate-x-0" : ""}

          /* Desktop: luôn hiện, thu gọn/mở rộng */
          lg:translate-x-0
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}
        `}
      >
        {/* Brand Logo + Close trên mobile */}
        <div
          className={`mb-6 flex items-center pb-6 border-b border-outline-variant ${isCollapsed ? "lg:px-4 lg:justify-center px-6 justify-between" : "px-6 justify-between"}`}
        >
          <Link
            href="/"
            className="flex items-center gap-3 min-w-0"
            onClick={handleNavClick}
          >
            <Image
              src="/logo.png"
              alt="FUSE Logo"
              width={40}
              height={40}
              className="shrink-0 object-contain"
            />
            {/* Ẩn text khi collapsed trên desktop, luôn hiện trên mobile */}
            <div className={isCollapsed ? "lg:hidden" : ""}>
              <h1 className="font-headline text-md font-extrabold text-primary">
                FUSE ADMIN
              </h1>
              <p className="font-sans text-[11px] font-medium text-on-surface-variant leading-none mt-0.5">
                Quản trị hệ thống
              </p>
            </div>
          </Link>
          {/* Nút đóng chỉ hiện trên mobile */}
          <button
            onClick={close}
            className="p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors text-on-surface-variant lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    title={isCollapsed ? item.label : undefined}
                    className={`
                      flex items-center gap-4 py-3 transition-all duration-150 active:scale-95
                      px-6
                      ${isCollapsed ? "lg:px-0 lg:justify-center" : ""}
                      ${
                        isActive
                          ? "text-primary font-bold border-r-4 border-primary bg-primary/10"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
                      }
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-on-surface-variant"}`}
                    />
                    <span
                      className={`font-sans text-xs font-semibold ${isCollapsed ? "lg:hidden" : ""}`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto border-t border-outline-variant pt-4">
          <a
            href="#"
            title={isCollapsed ? "Nhật ký bảo mật" : undefined}
            className={`flex items-center gap-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-150 px-6 ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
          >
            <ShieldAlert className="w-5 h-5 text-on-surface-variant shrink-0" />
            <span
              className={`font-sans text-xs font-semibold ${isCollapsed ? "lg:hidden" : ""}`}
            >
              Nhật ký bảo mật
            </span>
          </a>
          <a
            href="#"
            title={isCollapsed ? "Hỗ trợ" : undefined}
            className={`flex items-center gap-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-150 px-6 ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
          >
            <HelpCircle className="w-5 h-5 text-on-surface-variant shrink-0" />
            <span
              className={`font-sans text-xs font-semibold ${isCollapsed ? "lg:hidden" : ""}`}
            >
              Hỗ trợ
            </span>
          </a>
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Đăng xuất" : undefined}
            className={`w-full flex items-center gap-4 py-3 text-error hover:bg-error-container/10 transition-all duration-150 text-left active:scale-95 px-6 ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
          >
            <LogOut className="w-5 h-5 text-error shrink-0" />
            <span
              className={`font-sans text-xs font-semibold ${isCollapsed ? "lg:hidden" : ""}`}
            >
              Đăng xuất
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
