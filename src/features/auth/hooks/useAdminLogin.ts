"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { LOCAL_API_ERROR_MESSAGES } from "@/constants/constants/api-error-messages";
import { CMS_ROUTES } from "@/constants/constants/routes";
import { EUserRole } from "@/constants/enums/user.enum";
import { useAuthStore } from "@/features/auth/store/authStore";
import { tryRestoreSession } from "@/features/auth/utils/auth-bootstrap";
import { showErrorToast, showSuccessToast } from "@/lib/ui/toast";
import { loginSchema, type LoginPayload } from "@/lib/validations/authSchema";
import { fetchCurrentAdmin } from "@/services/account.service";
import { login } from "@/services/auth.service";

export function useAdminLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    let mounted = true;

    const checkExistingSession = async () => {
      const restored = await tryRestoreSession();

      if (!mounted) {
        return;
      }

      if (restored) {
        const currentUser = useAuthStore.getState().user;

        if (currentUser?.role === EUserRole.ADMIN) {
          router.replace(CMS_ROUTES.DASHBOARD);
          return;
        }

        useAuthStore.getState().clearAuth();
      }

      setIsCheckingAuth(false);
    };

    void checkExistingSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  const onSubmit = async (data: LoginPayload) => {
    setIsLoading(true);

    try {
      const loginResponse = await login(data);

      useAuthStore
        .getState()
        .setAccessToken(
          loginResponse.accessToken,
          loginResponse.expiresAt,
          loginResponse.expiresIn,
        );

      const user = await fetchCurrentAdmin();

      if (user.role !== EUserRole.ADMIN) {
        useAuthStore.getState().clearAuth();
        showErrorToast(LOCAL_API_ERROR_MESSAGES.CMS_ACCESS_DENIED);
        return;
      }

      setAuth(
        loginResponse.accessToken,
        user,
        loginResponse.expiresAt,
        loginResponse.expiresIn,
      );

      showSuccessToast("Đăng nhập thành công! Đang chuyển hướng...");

      window.setTimeout(() => {
        router.push(CMS_ROUTES.DASHBOARD);
      }, 1000);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Tên đăng nhập hoặc mật khẩu không chính xác.";
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };
  const toggleShowPassword = () => {
    setShowPassword((value) => !value);
  };

  return {
    form,
    onSubmit,
    isCheckingAuth,
    isLoading,
    showPassword,
    toggleShowPassword,
  };
}
