"use client"

import { memo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Skeleton } from "../ui/skeleton"
import { EmptyState } from "./EmptyState"
import { cn } from "../../lib/utils"

// #24 — Generic type constrained to objects with an id
export interface DataTableColumn<T extends object> {
  key: string
  header: string | (() => React.ReactNode)
  cell: (row: T) => React.ReactNode
  className?: string
  sortable?: boolean
}

interface DataTableProps<T extends object> {
  columns: DataTableColumn<T>[]
  data: T[]
  isLoading?: boolean
  skeletonRows?: number
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  onRowClick?: (row: T) => void
  rowKey?: (row: T) => string
  rowAriaLabel?: (row: T, index: number) => string
  className?: string
  /** data-testid for test selectors (#238) */
  testId?: string
  caption?: string
}

export function DataTable<T extends object>({
  columns,
  data,
  isLoading,
  skeletonRows = 5,
  emptyTitle = "Tidak ada data",
  emptyDescription = "Belum ada data untuk ditampilkan.",
  emptyIcon,
  onRowClick,
  rowKey,
  rowAriaLabel,
  className,
  testId,
  caption,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn("rounded-lg border", className)} data-testid={testId ? `${testId}-loading` : undefined}>
        <Table>
          {caption && <caption className="sr-only">{caption}</caption>}
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                // #187 — Add scope="col" for table accessibility
                <TableHead
                  key={col.key}
                  scope="col"
                  className={cn("text-xs font-medium uppercase tracking-wider text-muted-foreground", col.className)}
                >
                  {typeof col.header === "function" ? col.header() : col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              // #38 — Avoid index keys for dynamic lists; skeleton rows are stable so index is acceptable
              <TableRow key={`skeleton-${i}`} className="hover:bg-transparent" aria-hidden="true">
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton className="h-5 w-full max-w-[120px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!data.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
      />
    )
  }

  return (
    <div
      className={cn("overflow-x-auto rounded-lg border table-scroll-container", className)}
      data-testid={testId}
    >
      <Table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              // #187 — scope="col" for all column headers
              <TableHead
                key={col.key}
                scope="col"
                className={cn("text-xs font-medium uppercase tracking-wider text-muted-foreground", col.className)}
              >
                {typeof col.header === "function" ? col.header() : col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow
              key={rowKey ? rowKey(row) : idx}
              className={cn(
                "transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/50",
                onRowClick && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              )}
              onClick={() => onRowClick?.(row)}
              {...(onRowClick ? {
                role: "button",
                tabIndex: 0,
                "aria-label": rowAriaLabel ? rowAriaLabel(row, idx) : `Lihat detail baris ${rowKey ? rowKey(row) : idx + 1}`,
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onRowClick(row)
                  }
                },
              } : {})}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={cn("py-3", col.className)}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
