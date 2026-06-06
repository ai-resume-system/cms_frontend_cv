"use client";

import {
  Bell,
  ChevronDown,
  KeyRound,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ChangePasswordModal } from "@/components/layouts/ChangePasswordModal";
import { CMS_ROUTES } from "@/constants/constants/routes";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useSidebarStore } from "@/features/sidebar/store/sidebarStore";
import { logout } from "@/services/auth.service";

export default function Header() {
  const { user, clearAuth } = useAuthStore();
  const { isCollapsed, toggle: toggleSidebar } = useSidebarStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      await logout();
    } catch {
    } finally {
      clearAuth();
      window.location.replace(CMS_ROUTES.LOGIN);
    }
  };

  return (
    <>
      <header
        className={`fixed right-0 top-0 z-40 flex h-14 w-full items-center justify-between bg-white shadow-md px-2 transition-all duration-300 sm:h-16 sm:px-4 md:px-3 lg:px-4 ${
          isCollapsed ? "lg:w-[calc(100%-72px)]" : "lg:w-[calc(100%-256px)]"
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center">
          <button
            className="shrink-0 rounded-lg py-2 px-3 text-on-surface-variant transition-colors hover:bg-surface-container-low active:scale-95"
            onClick={toggleSidebar}
            title="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4 md:gap-6">
          {/* <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low transition-colors hover:bg-surface-container-high active:scale-95 sm:h-10 sm:w-10">
            <Bell className="h-4 w-4 text-on-surface sm:h-5 sm:w-5" />
            <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full border-2 border-surface-container-lowest bg-primary sm:right-2.5 sm:top-2 sm:h-2.5 sm:w-2.5" />
          </button> */}

          {/* <div className="hidden h-8 w-px bg-outline-variant md:block" /> */}

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
                className={`hidden h-4 w-4 text-on-surface-variant transition-transform sm:block ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
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

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
}
