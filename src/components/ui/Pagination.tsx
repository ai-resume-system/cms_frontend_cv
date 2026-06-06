"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current <= 3) {
    pages.push(2, 3, "ellipsis", total);
  } else if (current >= total - 2) {
    pages.push("ellipsis", total - 2, total - 1, total);
  } else {
    pages.push(
      "ellipsis",
      current - 1,
      current,
      current + 1,
      "ellipsis",
      total,
    );
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        className="p-1.5 sm:p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4 text-on-surface" />
      </button>

      {pages.map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-1 sm:px-2 py-2 font-sans text-xs text-on-surface-variant select-none"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            disabled={disabled}
            className={`min-w-[32px] sm:min-w-[36px] px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-sans text-xs font-bold transition-colors ${
              item === currentPage
                ? "bg-primary text-white"
                : "border border-outline-variant hover:bg-surface-container-low text-on-surface"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        className="p-1.5 sm:p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-50"
      >
        <ChevronRight className="w-4 h-4 text-on-surface" />
      </button>
    </div>
  );
}
