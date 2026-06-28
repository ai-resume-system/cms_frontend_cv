"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import { CMS_ROUTES } from "@/constants/constants/routes";
import { EUserRole } from "@/constants/enums/user.enum";
import { useAuthStore } from "@/features/auth/store/authStore";
import { tryRestoreSession } from "@/features/auth/utils/auth-bootstrap";
import { useSidebarStore } from "@/features/sidebar/store/sidebarStore";

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
        router.replace(CMS_ROUTES.LOGIN);
        return;
      }

      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role !== EUserRole.ADMIN) {
        useAuthStore.getState().clearAuth();
        router.replace(CMS_ROUTES.LOGIN);
        return;
      }

      setIsLoaded(true);
    };

    void bootstrap();
  }, [router]);

  if (!isLoaded || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="font-sans text-sm font-semibold text-on-surface-variant">
            Vui lòng chờ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface">
      <Sidebar />
      <div
        className={`flex min-h-screen flex-col pl-0 transition-all duration-300 ${
          isCollapsed ? "lg:pl-18" : "lg:pl-64"
        }`}
      >
        <Header />
        <main className="mx-auto w-full flex-1 overflow-x-hidden px-3 pb-8 pt-18 sm:px-4 sm:pb-12 sm:pt-20 md:px-6 md:pt-24 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
