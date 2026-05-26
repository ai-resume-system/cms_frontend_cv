"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/authStore";
import { tryRestoreSession } from "@/features/auth/utils/auth-bootstrap";
import { useSidebarStore } from "@/features/sidebar/store/sidebarStore";
import { EUserRole } from "@/constants/enums/user.enum";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { isCollapsed } = useSidebarStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const restored = await tryRestoreSession();

      if (!restored) {
        router.replace("/login");
        return;
      }

      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role !== EUserRole.Admin) {
        useAuthStore.getState().clearAuth();
        router.replace("/login");
        return;
      }

      setIsLoaded(true);
    };

    bootstrap();
  }, [router]);

  if (!isLoaded || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-sans text-xs font-semibold text-on-surface-variant">Đang bảo mật phiên truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Sidebar />
      <div
        className={`
          flex flex-col min-h-screen transition-all duration-300
          /* Mobile: không padding left (sidebar overlay) */
          pl-0
          /* Desktop: padding theo sidebar state */
          ${isCollapsed ? "lg:pl-[72px]" : "lg:pl-64"}
        `}
      >
        <Header />
        <main className="flex-1 pt-18 sm:pt-20 md:pt-24 px-3 sm:px-4 md:px-6 lg:px-8 pb-8 sm:pb-12 w-full max-w-[1400px] mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
