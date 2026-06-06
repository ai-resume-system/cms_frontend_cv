"use client";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      closeOnClick
      pauseOnHover
      draggable
      toastClassName={() =>
        "rounded-xl border border-outline-variant bg-white px-5 py-4 font-sans text-sm font-medium text-on-surface shadow-lg"
      }
      progressClassName={(props) => {
        if (props?.type === "success") return "!bg-[#16a34a]";
        if (props?.type === "error") return "!bg-error";
        return "!bg-primary";
      }}
    />
  );
}
