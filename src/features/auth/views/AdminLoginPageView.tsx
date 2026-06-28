"use client";

import Link from "next/link";
import { Eye, EyeOff, Lock, LogIn, Shield, User } from "lucide-react";

import { INFOMATION_COMPANY } from "@/constants/constants/infomation.constants";
import { useAdminLogin } from "@/features/auth/hooks/useAdminLogin";

export function AdminLoginPageView() {
  const {
    form,
    showPassword,
    isLoading,
    isCheckingAuth,
    onSubmit,
    toggleShowPassword,
  } = useAdminLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="font-sans text-xs font-semibold text-on-surface-variant">
            Vui lòng chờ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface p-margin-mobile font-sans text-on-surface md:p-margin-desktop">
      <div className="fixed left-0 top-0 z-50 h-1.5 w-full bg-linear-to-r from-primary via-primary-container to-primary" />

      <main className="relative z-10 flex w-full max-w-110 flex-col items-center gap-stack-lg">
        <div className="mb-3 flex flex-col items-center gap-2 text-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-xl bg-primary shadow-sm transition-transform duration-300 hover:scale-105">
            <Shield className="h-8 w-8 text-white" />
          </div>

          <h1 className="font-headline text-2xl font-bold uppercase tracking-tight text-primary text-headline-md">
            {INFOMATION_COMPANY.COMPANY_NAME} CMS
          </h1>

          <p className="max-w-75 font-sans text-body-md text-on-surface-variant">
            Hệ thống quản trị của hệ sinh thái FUSE
          </p>
        </div>

        <section className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label
                className="font-sans text-xs font-semibold text-on-surface-variant"
                htmlFor="email"
              >
                Tên đăng nhập Email
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />

                <input
                  {...register("email")}
                  className={`w-full rounded-lg border bg-transparent py-3 pl-10 pr-4 font-sans text-body-md text-on-surface outline-none transition-all placeholder:text-outline-variant ${
                    errors.email
                      ? "border-error focus:ring-error"
                      : "border-outline-variant focus:border-primary"
                  }`}
                  disabled={isLoading}
                  id="email"
                  placeholder="admin@gmail.com"
                  type="text"
                />
              </div>

              {errors.email && (
                <span className="text-xs font-medium text-error">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="font-sans text-xs font-semibold text-on-surface-variant"
                htmlFor="password"
              >
                Mật khẩu
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />

                <input
                  {...register("password")}
                  className={`w-full rounded-lg border bg-transparent py-3 pl-10 pr-12 font-sans text-body-md text-on-surface outline-none transition-all placeholder:text-outline-variant ${
                    errors.password
                      ? "border-error focus:ring-error"
                      : "border-outline-variant focus:border-primary"
                  }`}
                  disabled={isLoading}
                  id="password"
                  placeholder="Nhập mật khẩu"
                  type={showPassword ? "text" : "password"}
                />

                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface"
                  disabled={isLoading}
                  onClick={toggleShowPassword}
                  type="button"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {errors.password && (
                <span className="text-xs font-medium text-error">
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-sans text-body-md font-semibold text-white transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
              disabled={isLoading}
              type="submit"
            >
              <span>{isLoading ? "Đang xử lý..." : "Đăng nhập"}</span>
              <LogIn className="h-5 w-5" />
            </button>

            <div className="mt-2 flex items-center gap-2">
              <div className="h-px flex-1 bg-outline-variant" />
            </div>

            <p className="text-center font-sans text-xs leading-relaxed text-on-surface-variant">
              Liên hệ Admin để được cấp tài khoản hoặc biết thêm chi tiết.
              <br />
              <span>
                Số điện thoại:
                <Link
                  className="ml-1 text-primary hover:underline"
                  href={`tel:${INFOMATION_COMPANY.PHONE}`}
                >
                  {INFOMATION_COMPANY.PHONE}
                </Link>
              </span>
            </p>
          </form>
        </section>

        <footer className="mt-4 text-center">
          <p className="font-sans text-xs text-on-surface-variant">
            Bản quyền © {INFOMATION_COMPANY.COPYRIGHT_YEAR}{" "}
            {INFOMATION_COMPANY.COMPANY_NAME}. Bảo lưu mọi quyền.
          </p>
        </footer>
      </main>

      <div className="fixed bottom-0 left-0 z-50 h-1.5 w-full bg-linear-to-r from-primary via-primary-container to-primary" />
    </div>
  );
}
