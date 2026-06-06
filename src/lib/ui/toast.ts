"use client";

import { toast } from "react-toastify";

const DEFAULT_TOAST_OPTIONS = {
  closeOnClick: true,
  pauseOnHover: true,
  theme: "light" as const,
};

export function showSuccessToast(message: string) {
  toast.success(message, {
    ...DEFAULT_TOAST_OPTIONS,
    autoClose: 3000,
  });
}

export function showErrorToast(message: string) {
  toast.error(message, {
    ...DEFAULT_TOAST_OPTIONS,
    autoClose: 4000,
  });
}

export function showInfoToast(message: string) {
  toast.info(message, {
    ...DEFAULT_TOAST_OPTIONS,
    autoClose: 3000,
  });
}
