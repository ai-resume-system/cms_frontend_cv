"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/authStore";
import { tryRestoreSession } from "@/features/auth/utils/auth-bootstrap";
import { loginSchema, LoginPayload } from "@/lib/validations/authSchema";
import { apiService } from "@/services/api-service";
import { API_ENDPOINTS } from "@/constants/api";
import { EUserRole } from "@/constants/enums/user.enum";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Shield, User, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { INFOMATION_COMPANY } from "@/constants/constants/infomation.constants";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      const restored = await tryRestoreSession();

      if (restored) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.role === EUserRole.Admin) {
          router.replace("/");
          return;
        }
        useAuthStore.getState().clearAuth();
      }

      setIsCheckingAuth(false);
    };

    checkExistingSession();
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginPayload) => {
    setIsLoading(true);
    try {
      const loginResponse = await apiService.post<{ accessToken: string }>(
        API_ENDPOINTS.AUTH.LOGIN,
        data,
      );

      useAuthStore.getState().setAccessToken(loginResponse.accessToken);

      let user: { id: string; email: string; role: EUserRole };
      try {
        user = await apiService.get<{
          id: string;
          email: string;
          role: EUserRole;
        }>(API_ENDPOINTS.ACCOUNT.ME, { auth: true });
      } catch {
        useAuthStore.getState().clearAuth();
        throw new Error("Không thể lấy thông tin tài khoản.");
      }

      if (user.role !== EUserRole.Admin) {
        useAuthStore.getState().clearAuth();
        toast.error(
          "Tài khoản của bạn không có quyền truy cập hệ thống Quản trị viên.",
        );
        setIsLoading(false);
        return;
      }

      setAuth(loginResponse.accessToken, user);
      toast.success("Đăng nhập thành công! Đang chuyển hướng...");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error: any) {
      toast.error(
        error.message || "Tên đăng nhập hoặc mật khẩu không chính xác.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-sans text-xs font-semibold text-on-surface-variant">
            Đang kiểm tra phiên đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface flex items-center justify-center min-h-screen p-margin-mobile md:p-margin-desktop font-sans relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Decorative Top Border */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-primary-container to-primary z-50"></div>

      <main className="w-full max-w-[440px] flex flex-col items-center gap-stack-lg relative z-10">
        {/* Brand Identity Section */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-2 shadow-sm transition-transform hover:scale-105 duration-300">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="font-headline text-headline-md font-bold text-primary tracking-tight text-2xl uppercase">
            {INFOMATION_COMPANY.COMPANY_NAME} Cms
          </h1>
          <p className="font-sans text-body-md text-on-surface-variant max-w-[300px]">
            Hệ thống quản trị của hệ sinh thái FUSE
          </p>
        </div>

        {/* Login Card */}
        <section className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Email (Tên đăng nhập) Input */}
            <div className="flex flex-col gap-1.5">
              <label
                className="font-sans text-xs font-semibold text-on-surface-variant"
                htmlFor="email"
              >
                Tên đăng nhập (Email)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                <input
                  {...register("email")}
                  className={`w-full pl-10 pr-4 py-3 bg-transparent border ${
                    errors.email
                      ? "border-error focus:ring-error"
                      : "border-outline-variant focus:border-primary"
                  } rounded-lg font-sans text-body-md text-on-surface outline-none transition-all placeholder:text-outline-variant`}
                  id="email"
                  placeholder="admin@gmail.com"
                  type="text"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-error font-medium">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label
                  className="font-sans text-xs font-semibold text-on-surface-variant"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                <input
                  {...register("password")}
                  className={`w-full pl-10 pr-12 py-3 bg-transparent border ${
                    errors.password
                      ? "border-error focus:ring-error"
                      : "border-outline-variant focus:border-primary"
                  } rounded-lg font-sans text-body-md text-on-surface outline-none transition-all placeholder:text-outline-variant`}
                  id="password"
                  placeholder="Nhập mật khẩu"
                  type={showPassword ? "text" : "password"}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-error font-medium">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Sign In Button */}
            <button
              className="w-full mt-2 bg-primary text-white font-sans text-body-md font-semibold py-3 px-4 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              <span>{isLoading ? "Đang xử lý..." : "Đăng nhập"}</span>
              <LogIn className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mt-2 h-px flex-1 bg-outline-variant">
              <div className="h-px flex-1 bg-outline-variant"></div>
            </div>

            <p className="font-sans text-xs text-on-surface-variant text-center leading-relaxed">
              Liên hệ Admin để được cấp tài khoản hoặc biết thêm chi tiết.
              <br />
              <span>
                Số điện thoại:
                <Link
                  href={`tel:${INFOMATION_COMPANY.PHONE}`}
                  className="text-primary hover:underline ml-1"
                >
                  {INFOMATION_COMPANY.PHONE}
                </Link>
              </span>
            </p>
          </form>
        </section>

        {/* Footer / Copyright */}
        <footer className="mt-4 text-center">
          <p className="font-sans text-xs text-on-surface-variant">
            Bản quyền © {INFOMATION_COMPANY.COPYRIGHT_YEAR}{" "}
            {INFOMATION_COMPANY.COMPANY_NAME}. Bảo lưu mọi quyền.
          </p>
        </footer>
      </main>
    </div>
  );
}
