"use client";

import React from "react";
import { cn } from "@/lib/admin/utils";

interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}

interface DataTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableHeader({ children, className }: DataTableHeaderProps) {
  return (
    <thead className={cn("bg-slate-50 dark:bg-slate-900/50", className)}>
      <tr>{children}</tr>
    </thead>
  );
}

interface DataTableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
}

export function DataTableHeaderCell({
  children,
  className,
  colSpan,
  rowSpan,
}: DataTableHeaderCellProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800",
        className
      )}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {children}
    </th>
  );
}

interface DataTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableBody({ children, className }: DataTableBodyProps) {
  return (
    <tbody className={cn("divide-y divide-slate-200 dark:divide-slate-800", className)}>
      {children}
    </tbody>
  );
}

interface DataTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DataTableRow({ children, className, onClick }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface DataTableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function DataTableCell({ children, className, colSpan }: DataTableCellProps) {
  return (
    <td
      className={cn("px-4 py-3 text-sm text-slate-700 dark:text-slate-300", className)}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}