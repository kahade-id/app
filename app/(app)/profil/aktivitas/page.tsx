"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heartbeat } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DataTable, DataTablePagination, PageHeader, ErrorState, PageTransition } from "@/components/shared"
import type { DataTableColumn } from "@/components/shared"
import { useActivityLog } from "@/lib/hooks/use-user"
import { formatDateTime } from "@/lib/date"
import { DEFAULT_PAGE_SIZE, ROUTES } from "@/lib/constants"
import type { PaginatedData } from "@/types/api"

interface AuditLogEntry {
  id: string
  action: string
  description: string
  ipAddress: string
  userAgent: string
  createdAt: string
}

export default function ActivityLogPage() {
  const router = useRouter()
  const [page, setPage] = React.useState(1)
  const { data, isLoading, isError, refetch } = useActivityLog({ page, limit: DEFAULT_PAGE_SIZE })

  // #18 — Type guard instead of unsafe type assertion
  function isPaginatedAuditLog(d: unknown): d is PaginatedData<AuditLogEntry> {
    if (!d || typeof d !== 'object') return false
    const obj = d as Record<string, unknown>
    return Array.isArray(obj.data) && typeof obj.total === 'number'
  }
  const paginated = isPaginatedAuditLog(data) ? data : undefined

  const columns: DataTableColumn<AuditLogEntry>[] = [
    { key: "action", header: "Aksi", cell: (row) => <span className="font-medium">{row.action}</span> },
    { key: "description", header: "Deskripsi", cell: (row) => <span className="max-w-[300px] truncate text-sm">{row.description}</span>, className: "hidden sm:table-cell" },
    { key: "ipAddress", header: "Alamat IP", cell: (row) => <span className="font-mono text-xs text-muted-foreground">{row.ipAddress}</span>, className: "hidden md:table-cell" },
    { key: "createdAt", header: "Waktu", cell: (row) => <span className="text-sm text-muted-foreground">{formatDateTime(row.createdAt)}</span> },
  ]

  if (isError) return <ErrorState title="Gagal Memuat Log Aktivitas" onRetry={() => refetch()} />

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Kembali" className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80" onClick={() => router.push(ROUTES.PROFILE)} data-testid="button-activity-back">
            <ArrowLeft className="size-4" />
          </Button>
          <PageHeader title="Log Aktivitas" description="Riwayat aktivitas akun Anda" />
        </div>

        <DataTable
          columns={columns}
          data={paginated?.data ?? []}
          isLoading={isLoading}
          emptyTitle="Belum Ada Aktivitas"
          emptyDescription="Belum ada riwayat aktivitas pada akun Anda."
          emptyIcon={<Heartbeat className="size-8" />}
          rowKey={(row) => row.id}
        />

        {paginated && paginated.total > 0 && (
          <DataTablePagination
            page={page}
            pageSize={DEFAULT_PAGE_SIZE}
            totalItems={paginated.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </PageTransition>
  )
}
