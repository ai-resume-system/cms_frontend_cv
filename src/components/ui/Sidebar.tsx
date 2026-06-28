"use client";

import {
  ChartBarStacked,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { CMS_ROUTES } from "@/constants/constants/routes";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useSidebarStore } from "@/features/sidebar/store/sidebarStore";
import { logout } from "@/services/auth.service";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const { isCollapsed, close } = useSidebarStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
    } finally {
      clearAuth();
      router.push(CMS_ROUTES.LOGIN);
    }
  };

  const navItems = [
    { label: "Tổng quan", href: CMS_ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: "Quản lý người dùng", href: CMS_ROUTES.USERS, icon: Users },
    { label: "Kiểm duyệt việc làm", href: CMS_ROUTES.JOBS, icon: CheckSquare },
    {
      label: "Danh mục ngành nghề",
      href: CMS_ROUTES.CATEGORIES,
      icon: ChartBarStacked,
    },
  ];

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      close();
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          !isCollapsed
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-70 -translate-x-full flex-col gap-4 overflow-y-auto border-r border-outline-variant bg-surface-container-highest py-4 transition-all duration-300 ${
          !isCollapsed ? "translate-x-0" : ""
        } lg:translate-x-0 ${isCollapsed ? "lg:w-18" : "lg:w-64"}`}
      >
        <div
          className={`mb-2 flex items-center justify-between border-b border-outline-variant pb-2 ${
            isCollapsed ? "px-6 lg:justify-center lg:px-4" : "px-6"
          }`}
        >
          <Link
            className="flex min-w-0 items-center gap-3"
            href={CMS_ROUTES.DASHBOARD}
            onClick={handleNavClick}
          >
            <Image
              alt="FUSE Logo"
              className="shrink-0 object-contain"
              height={40}
              src="/logo.png"
              width={40}
            />
            <div className={isCollapsed ? "lg:hidden" : ""}>
              <h1 className="font-headline text-md font-extrabold text-primary">
                FUSE ADMIN
              </h1>
              <p className="mt-0.5 font-sans text-[11px] font-medium leading-none text-on-surface-variant">
                Quản trị hệ thống
              </p>
            </div>
          </Link>
          <button
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low lg:hidden"
            onClick={close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    className={`flex items-center gap-4 px-6 py-3 transition-all duration-150 active:scale-95 ${
                      isCollapsed ? "lg:justify-center lg:px-0" : ""
                    } ${
                      isActive
                        ? "border-r-4 border-primary bg-primary/10 font-bold text-primary"
                        : "text-on-surface-variant hover:bg-white/60 hover:text-primary"
                    }`}
                    href={item.href}
                    onClick={handleNavClick}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${
                        isActive ? "text-primary" : "text-on-surface-variant"
                      }`}
                    />
                    <span
                      className={`font-sans font-semibold ${
                        isCollapsed ? "lg:hidden" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-outline-variant">
          <button
            className={`w-full mt-3 px-6 py-3 text-left text-error transition-all duration-150 hover:bg-error-container/50 active:scale-95 cursor-pointer ${
              isCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            onClick={handleLogout}
            title={isCollapsed ? "Đăng xuất" : undefined}
          >
            <span className="flex items-center justify-center gap-4">
              <LogOut className="h-5 w-5 shrink-0 text-error" />
              <span
                className={`font-sans text-sm font-semibold ${
                  isCollapsed ? "lg:hidden" : ""
                }`}
              >
                Đăng xuất
              </span>
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
