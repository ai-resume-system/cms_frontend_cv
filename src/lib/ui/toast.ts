import { LOCAL_API_ERROR_MESSAGES } from "@/constants/constants/api-error-messages";
import React from "react";
import { toast } from "react-toastify";

interface ToastOptions {
  toastId?: string;
}

const DEFAULT_TOAST_OPTIONS = {
  closeOnClick: true,
  pauseOnHover: true,
  theme: "light" as const,
};

export function showSuccessToast(message: string, options?: ToastOptions) {
  toast.success(
    React.createElement(
      "span",
      null,
      React.createElement(
        "strong",
        { className: "font-semibold text-slate-900" },
        "Success: ",
      ),
      React.createElement("span", { className: "text-slate-600" }, message),
    ),
    {
      ...DEFAULT_TOAST_OPTIONS,
      toastId: options?.toastId,
    },
  );
}

export function showErrorToast(message: string, options?: ToastOptions) {
  const isNetworkError =
    message === LOCAL_API_ERROR_MESSAGES.NETWORK_UNAVAILABLE;
  const activeToastId = isNetworkError ? "network-error" : options?.toastId;

  toast.error(
    React.createElement(
      "span",
      null,
      React.createElement(
        "strong",
        { className: "font-semibold text-slate-900" },
        "Error: ",
      ),
      React.createElement("span", { className: "text-slate-600" }, message),
    ),
    {
      ...DEFAULT_TOAST_OPTIONS,
      toastId: activeToastId,
    },
  );
}

export function showInfoToast(message: string, options?: ToastOptions) {
  toast.info(
    React.createElement(
      "span",
      null,
      React.createElement(
        "strong",
        { className: "font-semibold text-slate-900" },
        "Info: ",
      ),
      React.createElement("span", { className: "text-slate-600" }, message),
    ),
    {
      ...DEFAULT_TOAST_OPTIONS,
      toastId: options?.toastId,
    },
  );
}

export function showWarningToast(message: string, options?: ToastOptions) {
  toast.warning(
    React.createElement(
      "span",
      null,
      React.createElement(
        "strong",
        { className: "font-semibold text-slate-900" },
        "Warning: ",
      ),
      React.createElement("span", { className: "text-slate-600" }, message),
    ),
    {
      ...DEFAULT_TOAST_OPTIONS,
      toastId: options?.toastId,
    },
  );
}
