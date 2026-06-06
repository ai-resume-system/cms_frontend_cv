import React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from "lucide-react";

export interface TableColumn<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => React.ReactNode;
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
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40 shrink-0" />;
    }
    return sortOrder === "ASC" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary shrink-0" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary shrink-0" />
    );
  };

  return (
    <div
      className="overflow-x-auto w-full transition-all"
      style={{ maxHeight: maxHeight || "none", overflowY: maxHeight ? "auto" : "visible" }}
    >
      <table className={`w-full ${minWidth} border-collapse text-left`}>
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low font-sans text-xs font-bold text-on-surface-variant">
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
                  className={`px-3 py-3 sm:px-4 sm:py-3.5 font-bold uppercase tracking-wider select-none ${
                    col.sortable ? "cursor-pointer hover:text-primary transition-colors" : ""
                  } ${alignmentClass}`}
                >
                  <span
                    className={`inline-flex items-center gap-0.5 ${
                      col.align === "center"
                        ? "justify-center"
                        : col.align === "right"
                          ? "justify-end"
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
        <tbody className="divide-y divide-outline-variant font-sans text-xs text-on-surface">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  <p className="font-sans text-xs font-medium text-on-surface-variant">
                    Đang tải dữ liệu...
                  </p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-center font-medium text-on-surface-variant"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={`transition-colors hover:bg-surface-container-low/50 ${
                  rowIndex % 2 === 1 ? "bg-surface-container-low/10" : ""
                }`}
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
                      className={`px-3 py-3 sm:px-4 sm:py-3.5 align-middle font-medium ${alignmentClass}`}
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
  );
}
