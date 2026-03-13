"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Scales, CaretRight } from "@phosphor-icons/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingState, ErrorState, EmptyState, PageHeader, StatusBadge, DataTablePagination, PageTransition, SearchInput } from "@/components/shared"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { useMyDisputes } from "@/lib/hooks/use-dispute"
import { formatRelative } from "@/lib/date"
import { ROUTES, DISPUTE_STATUS_LABELS, DEFAULT_PAGE_SIZE } from "@/lib/constants"
import type { Dispute } from "@/types/dispute"

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "OPEN", label: "Terbuka" },
  { value: "ASSIGNED", label: "Ditugaskan" },
  { value: "UNDER_REVIEW", label: "Dalam Review" },
  { value: "WAITING_RESPONSE", label: "Menunggu Respons" },
  { value: "RESOLVED", label: "Selesai" },
  { value: "ESCALATED", label: "Dieskalasi" },
]

export default function DisputePage() {
  usePageTitle("Dispute")
  const router = useRouter()
  const [page, setPage] = React.useState(1)
  const [status, setStatus] = React.useState("ALL")
  const [search, setSearch] = React.useState("")
  // #278 — Debounce search to avoid API call on every keystroke
  const debouncedSearch = useDebounce(search, 300)

  // UX-001 FIX: useCallback must be at top-level of component, not inside JSX props
  // (Rules of Hooks violation). Extracted to a named handler here.
  const handleSearchChange = React.useCallback((v: string) => {
    setSearch(v)
    setPage(1)
  }, [])

  const params = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    ...(status !== "ALL" && { status }),
    ...(debouncedSearch && { search: debouncedSearch }),
  }

  const { data, isLoading, isError, refetch } = useMyDisputes(params)

  if (isLoading) return <LoadingState fullPage text="Memuat dispute..." />
  if (isError) return <ErrorState title="Gagal Memuat Dispute" onRetry={() => refetch()} />

  const disputes = data?.data ?? []

  return (
    <PageTransition className="space-y-6">
      <PageHeader title="Dispute" description="Daftar dispute transaksi Anda" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari dispute berdasarkan ID atau order..."
            data-testid="input-dispute-search"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[220px]" data-testid="select-dispute-status">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {disputes.length === 0 ? (
        <EmptyState
          title="Tidak Ada Dispute"
          description="Anda belum memiliki dispute."
          icon={<Scales className="size-8" />}
        />
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute: Dispute) => (
            <Card
              key={dispute.id}
              className="cursor-pointer transition-colors hover:bg-muted/50 hover:border-foreground/20"
              onClick={() => router.push(ROUTES.DISPUTE_DETAIL(dispute.id))}
            >
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
                    <Scales className="size-5 text-foreground/70" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-mono text-sm font-medium">{dispute.disputeId}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      Order: {dispute.orderId} · Diajukan oleh: {dispute.initiatedBy === "BUYER" ? "Pembeli" : dispute.initiatedBy === "SELLER" ? "Penjual" : "Keduanya"}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatRelative(dispute.createdAt)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={dispute.status} label={DISPUTE_STATUS_LABELS[dispute.status]} />
                  <CaretRight className="size-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.total > DEFAULT_PAGE_SIZE && (
        <DataTablePagination
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          totalItems={data.total}
          onPageChange={setPage}
        />
      )}
    </PageTransition>
  )
}
