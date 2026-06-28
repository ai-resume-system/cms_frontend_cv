"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  showCloseButton = true,
}: BaseModalProps) {
  // Ngăn cuộn trang khi mở modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Đóng modal khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-3 backdrop-blur-sm sm:p-4 transition-all duration-200">
      {/* Backdrop overlay click triggers onClose */}
      <div 
        className="fixed inset-0 cursor-default" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className={`relative w-full ${sizeClasses[size]} overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl z-10 flex flex-col animate-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="font-headline text-md font-bold text-on-surface flex items-center gap-2">
            {title}
          </h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-highest cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-outline-variant bg-surface-container-low px-4 py-3 sm:px-6 sm:py-4 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
