"use client";

import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useState } from "react";

import { showErrorToast, showSuccessToast } from "@/lib/ui/toast";
import { changePassword } from "@/services/account.service";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      showErrorToast("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showErrorToast("Mật khẩu xác nhận không khớp.");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showSuccessToast("Đổi mật khẩu thành công!");
      handleClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Đổi mật khẩu thất bại.";
      showErrorToast(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-on-surface/40 p-3 backdrop-blur-sm sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl">
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="font-headline text-sm font-bold text-on-surface sm:text-md">
            Đổi mật khẩu
          </h3>
          <button
            className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
            onClick={handleClose}
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
            <div className="relative">
              <input
                className="w-full rounded-lg border border-outline-variant bg-transparent px-3 py-2.5 pr-10 font-sans text-xs outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary sm:px-4"
                onChange={(event) =>
                  setPasswordForm((previous) => ({
                    ...previous,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Nhập lại mật khẩu mới"
                required
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant"
                onClick={() => setShowConfirmPassword((value) => !value)}
                type="button"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2 border-t border-outline-variant pt-3 sm:mt-4 sm:gap-3 sm:pt-4">
            <button
              className="rounded-lg border border-outline-variant px-3 py-2.5 font-sans text-xs font-semibold transition-colors hover:bg-surface-container-low sm:px-4"
              onClick={handleClose}
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
  );
}
