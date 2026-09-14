"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Search,
  Filter,
  Download,
  RefreshCw,
  X,
  RotateCcw,
} from "lucide-react";
import { cn, formatNumber, getPaginationInfo } from "@/lib/admin/utils";
import { TableColumn, ActionMenuItem, FilterState } from "@/lib/admin/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AdminTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  filters?: FilterState;
  onFilterChange?: (filters: Partial<FilterState>) => void;
  onClearFilters?: () => void;
  total?: number;
  loading?: boolean;
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  actionMenuItems?: (item: T) => ActionMenuItem<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function AdminTable<T extends object>({
  data,
  columns,
  filters,
  onFilterChange,
  onClearFilters,
  total,
  loading = false,
  searchable = true,
  searchKeys,
  actionMenuItems,
  onRowClick,
  emptyMessage = "No data available",
  className,
}: AdminTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string>(filters?.sortBy || "");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(filters?.sortOrder || "asc");
  const [localSearch, setLocalSearch] = useState(filters?.search || "");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLocalSearch(filters?.search || "");
  }, [filters?.search]);

  useEffect(() => {
    if (filters?.sortBy !== undefined) {
      setSortColumn(filters.sortBy);
    } else {
      setSortColumn("");
    }
  }, [filters?.sortBy]);

  useEffect(() => {
    if (filters?.sortOrder !== undefined) {
      setSortOrder(filters.sortOrder);
    } else {
      setSortOrder("asc");
    }
  }, [filters?.sortOrder]);

  const activeFilterCount = [
    Boolean(localSearch || (filters?.search && filters.search.trim() !== "")),
    Boolean(filters?.status),
    Boolean(filters?.role),
    Boolean(filters?.tier),
    Boolean(filters?.category),
    Boolean(filters?.type),
    Boolean(filters?.difficulty),
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const handleClearFilters = () => {
    setLocalSearch("");
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFilterChange?.({
        search: "",
        status: undefined,
        role: undefined,
        tier: undefined,
        category: undefined,
        type: undefined,
        difficulty: undefined,
        page: 1,
      });
    }
  };

  const handleSort = (key: string) => {
    const isSameColumn = (filters?.sortBy ?? sortColumn) === key;
    const currentOrder = (filters?.sortOrder ?? sortOrder);
    const nextOrder: "asc" | "desc" = isSameColumn && currentOrder === "asc" ? "desc" : "asc";

    setSortColumn(key);
    setSortOrder(nextOrder);

    onFilterChange?.({
      sortBy: key,
      sortOrder: nextOrder,
      page: 1,
    });
  };

  const handleSearch = (value: string) => {
    setLocalSearch(value);
    onFilterChange?.({ search: value, page: 1 });
  };

  const handleRefresh = () => {
    onFilterChange?.({ search: localSearch });
  };

  const paginationInfo = total
    ? getPaginationInfo(total, filters?.page || 1, filters?.pageSize || 10)
    : null;

  return (
    <div className={cn("w-full", className)}>
      {/* Table Header */}
      <div className="flex items-center justify-between mb-4 gap-4">
        {searchable && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search..."
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-8"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => handleSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-900/60 dark:hover:bg-rose-950/30 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Clear Filters
            </Button>
          )}
          <Button
            variant={showFilters || hasActiveFilters ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-1.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Status
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                value={filters?.status || ""}
                onChange={(e) =>
                  onFilterChange?.({
                    status: (e.target.value as FilterState["status"]) || undefined,
                  })
                }
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Role
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                value={filters?.role || ""}
                onChange={(e) =>
                  onFilterChange?.({
                    role: (e.target.value as FilterState["role"]) || undefined,
                  })
                }
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>

            {/* Page Size */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Per Page
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                value={filters?.pageSize || 10}
                onChange={(e) =>
                  onFilterChange?.({
                    pageSize: Number(e.target.value),
                    page: 1,
                  })
                }
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {hasActiveFilters
                ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} applied`
                : "No filters applied"}
            </span>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset all filters
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider",
                      column.sortable &&
                        "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors",
                    )}
                    style={{ width: column.width }}
                    onClick={() =>
                      column.sortable && handleSort(String(column.key))
                    }
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={cn(
                              "h-3 w-3",
                              sortColumn === String(column.key) &&
                                sortOrder === "asc"
                                ? "text-slate-900 dark:text-slate-100"
                                : "text-slate-400",
                            )}
                          />
                          <ChevronDown
                            className={cn(
                              "h-3 w-3 -mt-1",
                              sortColumn === String(column.key) &&
                                sortOrder === "desc"
                                ? "text-slate-900 dark:text-slate-100"
                                : "text-slate-400",
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {actionMenuItems && (
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-16">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (actionMenuItems ? 1 : 0)}
                    className="px-4 py-8 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actionMenuItems ? 1 : 0)}
                    className="px-4 py-8 text-center"
                  >
                    <p className="text-slate-500 dark:text-slate-400">
                      {emptyMessage}
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="mt-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-900/60 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3 mr-1.5" />
                        Clear filters
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                      onRowClick && "cursor-pointer",
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-4 py-3 text-sm"
                      >
                        {column.render ? (
                          column.render(row[column.key as keyof T], row)
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">
                            {String(row[column.key as keyof T] ?? "")}
                          </span>
                        )}
                      </td>
                    ))}
                    {actionMenuItems && (
                      <td className="px-4 py-3 text-right">
                        <ActionMenu items={actionMenuItems(row)} data={row} />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {paginationInfo && (total !== undefined ? total > 0 : paginationInfo.totalPages > 0) && (
        <div className="flex flex-wrap items-center justify-between mt-4 gap-3">
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>
              Showing {formatNumber(paginationInfo.startIndex)} to{" "}
              {formatNumber(paginationInfo.endIndex ?? 0)} of {formatNumber(total ?? 0)}{" "}
              results
            </span>
            {onFilterChange && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Rows:</span>
                <select
                  value={filters?.pageSize && filters.pageSize >= 1000 ? "all" : (filters?.pageSize || 10)}
                  onChange={(e) => {
                    const newSize = e.target.value === "all" ? 10000 : Number(e.target.value);
                    onFilterChange({ pageSize: newSize, page: 1 });
                  }}
                  className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value="all">All</option>
                </select>
              </div>
            )}
          </div>
          {paginationInfo.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!paginationInfo.hasPrevPage}
                onClick={() =>
                  onFilterChange?.({ page: Math.max(1, (filters?.page || 1) - 1) })
                }
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {(() => {
                  const current = filters?.page || 1;
                  const totalP = paginationInfo.totalPages;
                  let pageItems: (number | string)[] = [];

                  if (totalP <= 7) {
                    pageItems = Array.from({ length: totalP }, (_, i) => i + 1);
                  } else if (current <= 4) {
                    pageItems = [1, 2, 3, 4, 5, "...", totalP];
                  } else if (current >= totalP - 3) {
                    pageItems = [1, "...", totalP - 4, totalP - 3, totalP - 2, totalP - 1, totalP];
                  } else {
                    pageItems = [1, "...", current - 1, current, current + 1, "...", totalP];
                  }

                  return pageItems.map((item, idx) => {
                    if (item === "...") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1.5 py-1 text-xs text-slate-400 dark:text-slate-500 select-none"
                        >
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(item);
                    const isActive = pageNum === current;
                    return (
                      <Button
                        key={pageNum}
                        variant={isActive ? "primary" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => onFilterChange?.({ page: pageNum })}
                      >
                        {pageNum}
                      </Button>
                    );
                  });
                })()}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={!paginationInfo.hasNextPage}
                onClick={() =>
                  onFilterChange?.({ page: Math.min(paginationInfo.totalPages, (filters?.page || 1) + 1) })
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Action Menu Component
function ActionMenu<T>({ items, data }: { items: ActionMenuItem<T>[]; data: T }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-1">
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {item.divider && (
                  <div className="border-t border-slate-200 dark:border-slate-800 my-1" />
                )}
                <button
                  onClick={() => {
                    item.onClick?.(data);
                    setIsOpen(false);
                  }}
                  disabled={item.disabled}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors",
                    item.danger
                      ? "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                    item.disabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
