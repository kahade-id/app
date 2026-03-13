"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield } from "@phosphor-icons/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageTransition, PageHeader, DataTable, DataTablePagination, ErrorState, StatusBadge, SearchInput } from "@/components/shared"
import type { DataTableColumn } from "@/components/shared"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useTransactions } from "@/lib/hooks/use-transactions"
import { formatIDR } from "@/lib/currency"
import { formatRelative } from "@/lib/date"
import { ROUTES, ORDER_STATUS_LABELS, DEFAULT_PAGE_SIZE } from "@/lib/constants"
import type { Order, OrderStatus } from "@/types/transaction"

const ESCROW_STATUS_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "WAITING_CONFIRMATION", label: "Menunggu Konfirmasi" },
  { value: "WAITING_PAYMENT", label: "Menunggu Pembayaran" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "IN_DELIVERY", label: "Dalam Pengiriman" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "DISPUTED", label: "Dalam Sengketa" },
  { value: "CANCELLED", label: "Dibatalkan" },
]

export default function EscrowPage() {
  usePageTitle("Escrow")
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL")
  const { data, isLoading, error, refetch } = useTransactions({
    page,
    limit: DEFAULT_PAGE_SIZE,
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    ...(search && { search }),
  })

  if (error) return <ErrorState title="Gagal memuat data escrow" onRetry={() => refetch()} />

  const escrows: Order[] = data?.data ?? []

  const columns: DataTableColumn<Order>[] = [
    {
      key: "orderId",
      header: "ID Order",
      cell: (row) => <span className="font-mono text-xs">{row.orderId}</span>,
    },
    {
      key: "title",
      header: "Judul",
      cell: (row) => <span className="max-w-[200px] truncate font-medium">{row.title}</span>,
    },
    {
      key: "orderValue",
      header: "Jumlah",
      cell: (row) => <span className="font-medium">{formatIDR(row.orderValue ?? 0)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} label={ORDER_STATUS_LABELS[row.status]} />,
    },
    {
      key: "createdAt",
      header: "Waktu",
      cell: (row) => <span className="text-sm text-muted-foreground">{formatRelative(row.createdAt)}</span>,
    },
  ]

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title="Escrow Saya"
        description="Daftar transaksi escrow Anda"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Cari escrow berdasarkan ID atau judul..."
            data-testid="input-escrow-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as OrderStatus | "ALL"); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[220px]" data-testid="select-escrow-status">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            {ESCROW_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={escrows}
        isLoading={isLoading}
        emptyTitle="Belum ada escrow aktif"
        emptyDescription="Anda tidak memiliki transaksi escrow yang sedang berjalan."
        emptyIcon={<Shield className="size-8" />}
        onRowClick={(row) => router.push(ROUTES.TRANSACTION_DETAIL(row.id))}
        rowKey={(row) => row.id}
      />

      {data && (data.total ?? 0) > DEFAULT_PAGE_SIZE && (
        <DataTablePagination
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          totalItems={data.total ?? 0}
          onPageChange={setPage}
        />
      )}
    </PageTransition>
  )
}
