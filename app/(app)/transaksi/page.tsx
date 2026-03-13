"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Plus } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, DataTablePagination, PageHeader, SearchInput, ErrorState, PageTransition, SortButton } from "@/components/shared"
import type { DataTableColumn } from "@/components/shared"
import { TransactionStatusBadge } from "@/components/app/transaction/TransactionStatusBadge"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useTransactions } from "@/lib/hooks/use-transactions"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { formatIDR } from "@/lib/currency"
import { formatRelative } from "@/lib/date"
import { ROUTES, DEFAULT_PAGE_SIZE } from "@/lib/constants"
import type { Order, OrderStatus } from "@/types/transaction"

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "Semua Status" },
  { value: "WAITING_CONFIRMATION", label: "Menunggu Konfirmasi" },
  { value: "WAITING_PAYMENT", label: "Menunggu Pembayaran" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "IN_DELIVERY", label: "Dalam Pengiriman" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "DISPUTED", label: "Dalam Sengketa" },
  { value: "CANCELLED", label: "Dibatalkan" },
]

// #225 — URL state sync: read initial state from URL params
function useTransactionFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const role = searchParams.get("role") ?? "ALL"
  const status = searchParams.get("status") ?? "ALL"
  const search = searchParams.get("search") ?? ""
  const sortField = searchParams.get("sortBy") ?? null
  const sortDir = (searchParams.get("sortDir") ?? null) as "asc" | "desc" | null

  const updateParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "ALL") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const setPage = React.useCallback((p: number) => updateParams({ page: String(p) }), [updateParams])
  const setRole = React.useCallback((v: string) => updateParams({ role: v, page: null }), [updateParams])
  const setStatus = React.useCallback((v: string) => updateParams({ status: v, page: null }), [updateParams])
  const setSearch = React.useCallback((v: string) => updateParams({ search: v, page: null }), [updateParams])

  const toggleSort = React.useCallback((field: string) => {
    if (sortField !== field) {
      updateParams({ sortBy: field, sortDir: "desc", page: null })
    } else if (sortDir === "desc") {
      updateParams({ sortDir: "asc", page: null })
    } else {
      updateParams({ sortBy: null, sortDir: null, page: null })
    }
  }, [sortField, sortDir, updateParams])

  return { page, role, status, search, sortField, sortDir, setPage, setRole, setStatus, setSearch, toggleSort }
}

// #011 FIX: Wrapping inner component in Suspense because useSearchParams()
// requires a Suspense boundary in Next.js App Router. Without it, Next.js
// de-optimizes the entire route to client-side rendering.
function TransaksiContent() {
  usePageTitle("Transaksi")
  const router = useRouter()
  const { page, role, status, search, sortField, sortDir, setPage, setRole, setStatus, setSearch, toggleSort } = useTransactionFilters()

  // #56 — Debounce search: 300ms delay before API call
  const debouncedSearch = useDebounce(search, 300)

  const params = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    ...(role !== "ALL" && { role: role as "BUYER" | "SELLER" }),
    ...(status !== "ALL" && { status: status as OrderStatus }),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(sortField && sortDir && { sortBy: sortField, sortOrder: sortDir }),
  }

  const { data, isLoading, isError, refetch } = useTransactions(params)

  // #31/#172 — useCallback for row click handler
  const handleRowClick = React.useCallback(
    (row: Order) => router.push(ROUTES.TRANSACTION_DETAIL(row.id)),
    [router]
  )

  const getRowKey = React.useCallback((row: Order) => row.id, [])

  // #31 — useCallback for sort handlers to prevent new functions per render
  const handleSortOrderValue = React.useCallback(
    () => <SortButton label="Nilai" active={sortField === "orderValue"} direction={sortField === "orderValue" ? sortDir : null} onClick={() => toggleSort("orderValue")} />,
    [sortField, sortDir, toggleSort]
  )

  const handleSortWaktu = React.useCallback(
    () => <SortButton label="Waktu" active={sortField === "createdAt"} direction={sortField === "createdAt" ? sortDir : null} onClick={() => toggleSort("createdAt")} />,
    [sortField, sortDir, toggleSort]
  )

  const columns: DataTableColumn<Order>[] = React.useMemo(() => [
    { key: "orderId", header: "ID Order", cell: (row) => <span className="font-mono text-xs">{row.orderId}</span> },
    { key: "title", header: "Judul", cell: (row) => <span className="block max-w-[200px] truncate font-medium">{row.title}</span> },
    { key: "status", header: "Status", cell: (row) => <TransactionStatusBadge status={row.status} /> },
    { key: "orderValue", header: handleSortOrderValue, cell: (row) => formatIDR(row.orderValue ?? 0) },
    {
      key: "counterpart", header: "Pihak Lawan", cell: (row) => {
        const isBuyerRole = role === "BUYER"
        const isSellerRole = role === "SELLER"
        const counterpart = isBuyerRole ? row.seller : isSellerRole ? row.buyer : row.seller
        const roleLabel = isBuyerRole ? "Penjual" : isSellerRole ? "Pembeli" : "Penjual"
        if (!counterpart?.username) return "-"
        return (
          <div>
            <span className="font-medium">@{counterpart.username}</span>
            <span className="ml-1 text-xs text-muted-foreground">({roleLabel})</span>
          </div>
        )
      }
    },
    { key: "createdAt", header: handleSortWaktu, cell: (row) => formatRelative(row.createdAt) },
  ], [handleSortOrderValue, handleSortWaktu, role])

  if (isError) {
    return <ErrorState title="Gagal Memuat Transaksi" onRetry={() => refetch()} />
  }

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title="Transaksi"
        description="Kelola semua transaksi Anda"
        action={
          <Button onClick={() => router.push(ROUTES.TRANSACTION_NEW)} data-testid="button-create-transaction">
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Buat Transaksi
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* #31 — onValueChange wrapped in useCallback-derived setRole */}
            <Tabs value={role} onValueChange={setRole} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="ALL">Semua</TabsTrigger>
                <TabsTrigger value="BUYER">Sebagai Pembeli</TabsTrigger>
                <TabsTrigger value="SELLER">Sebagai Penjual</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter status transaksi" data-testid="select-transaction-status">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Cari transaksi..."
                className="w-full sm:w-[250px]"
                data-testid="input-transaction-search"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyTitle="Belum Ada Transaksi"
        emptyDescription="Anda belum memiliki transaksi. Mulai buat transaksi pertama Anda."
        onRowClick={handleRowClick}
        rowKey={getRowKey}
        testId="transaksi-table"
        caption="Daftar transaksi Anda"
      />

      {data && data.total > 0 && (
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

export default function TransaksiPage() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center h-40"><span className="text-muted-foreground text-sm">Memuat...</span></div>}>
      <TransaksiContent />
    </React.Suspense>
  )
}
