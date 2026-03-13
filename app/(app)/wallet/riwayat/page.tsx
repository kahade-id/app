"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ClockCounterClockwise } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, DataTablePagination, PageHeader, ErrorState, PageTransition, DateRangePicker } from "@/components/shared"
import { useWalletHistory } from "@/lib/hooks/use-wallet"
import { ROUTES, DEFAULT_PAGE_SIZE } from "@/lib/constants"
import type { DateRange } from "react-day-picker"
import type { WalletTransactionType } from "@/types/wallet"
import { getWalletHistoryColumns } from "@/components/app/wallet/WalletTransactionRow"

const TYPE_OPTIONS = [
  { value: "ALL", label: "Semua Jenis" },
  { value: "TOP_UP", label: "Top Up" },
  { value: "WITHDRAW", label: "Penarikan" },
  { value: "ORDER_LOCK", label: "Dana Escrow" },
  { value: "ORDER_RELEASE", label: "Dana Dilepas" },
  { value: "ORDER_REFUND", label: "Pengembalian Dana" },
  { value: "FEE_DEDUCT", label: "Biaya Platform" },
  { value: "REFERRAL_REWARD", label: "Hadiah Referral" },
]

export default function RiwayatWalletPage() {
  const router = useRouter()
  const [page, setPage] = React.useState(1)
  const [typeFilter, setTypeFilter] = React.useState("ALL")
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  const params = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    ...(typeFilter !== "ALL" && { type: typeFilter as WalletTransactionType }),
    ...(dateRange?.from && { startDate: dateRange.from.toISOString() }),
    ...(dateRange?.to && { endDate: new Date(new Date(dateRange.to).setHours(23, 59, 59, 999)).toISOString() }),
  }

  const { data, isLoading, isError, refetch } = useWalletHistory(params)
  const columns = getWalletHistoryColumns()

  if (isError) return <ErrorState title="Gagal Memuat Riwayat" onRetry={() => refetch()} />

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Kembali" className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80" onClick={() => router.push(ROUTES.WALLET)} data-testid="button-wallet-history-back">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <PageHeader title="Riwayat Wallet" description="Lihat semua riwayat transaksi wallet" />
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Filter:</span>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-wallet-tx-type">
                  <SelectValue placeholder="Filter Jenis" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="w-full sm:w-auto">
                <DateRangePicker
                  value={dateRange}
                  onChange={(range) => { setDateRange(range); setPage(1) }}
                  placeholder="Pilih rentang tanggal"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          emptyTitle="Belum Ada Riwayat"
          emptyDescription="Belum ada riwayat transaksi wallet."
          emptyIcon={<ClockCounterClockwise className="size-8" />}
          rowKey={(row) => row.id}
        />

        {data && data.total > 0 && (
          <DataTablePagination
            page={page}
            pageSize={DEFAULT_PAGE_SIZE}
            totalItems={data.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </PageTransition>
  )
}
