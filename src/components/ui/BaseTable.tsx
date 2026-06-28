import React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from "lucide-react";

export interface TableColumn<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface BaseTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
  onSort?: (field: string, order: "ASC" | "DESC") => void;
  minWidth?: string;
  maxHeight?: string;
}

export function BaseTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Không có dữ liệu phù hợp.",
  sortField,
  sortOrder,
  onSort,
  minWidth = "w-full",
  maxHeight,
}: BaseTableProps<T>) {
  const handleHeaderClick = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;

    let newOrder: "ASC" | "DESC" = "ASC";
    if (sortField === column.key) {
      newOrder = sortOrder === "ASC" ? "DESC" : "ASC";
    }
    onSort(column.key, newOrder);
  };

  const renderSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;
    if (sortField !== column.key) {
      return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40 shrink-0" />;
    }
    return sortOrder === "ASC" ? (
      <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary shrink-0 animate-in fade-in duration-200" />
    ) : (
      <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary shrink-0 animate-in fade-in duration-200" />
    );
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className="overflow-x-auto"
        style={{ maxHeight: maxHeight || "none", overflowY: maxHeight ? "auto" : "visible" }}
      >
        <table className={`w-full ${minWidth} border-collapse text-left text-sm`}>
          <thead>
            <tr className="bg-gray-100/70 border-b border-outline-variant/15 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              {columns.map((col) => {
                const alignmentClass =
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                      ? "text-right"
                      : "text-left";

                return (
                  <th
                    key={col.key}
                    onClick={() => handleHeaderClick(col)}
                    className={`px-6 py-4.5 font-semibold select-none transition-colors duration-200 ${
                      col.sortable && onSort ? "cursor-pointer hover:bg-slate-200/40 hover:text-primary" : ""
                    } ${alignmentClass} ${col.className ?? ""}`}
                  >
                    <span
                      className={`inline-flex items-center ${
                        col.align === "center"
                          ? "justify-center w-full"
                          : col.align === "right"
                            ? "justify-end w-full"
                            : "justify-start"
                      }`}
                    >
                      {col.header}
                      {renderSortIcon(col)}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans text-xs text-on-surface">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    <p className="font-sans text-xs font-bold text-on-surface-variant">
                      Đang tải dữ liệu...
                    </p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center font-bold text-on-surface-variant"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className="transition duration-150 hover:bg-slate-55/30"
                >
                  {columns.map((col) => {
                    const alignmentClass =
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                          ? "text-right"
                          : "text-left";

                    return (
                      <td
                        key={`${row.id}-${col.key}`}
                        className={`px-6 py-4.5 align-middle font-medium text-slate-700 ${alignmentClass} ${col.className ?? ""}`}
                      >
                        {col.render ? col.render(row, rowIndex) : (row as any)[col.key] ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
