"use client"

import * as React from "react"
import { Star } from "@phosphor-icons/react"
import { DataTable, DataTablePagination, PageHeader, ErrorState, PageTransition } from "@/components/shared"
import type { DataTableColumn } from "@/components/shared"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useMyRatings } from "@/lib/hooks/use-rating"
import { formatDateTime } from "@/lib/date"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import type { Rating } from "@/types/rating"
import type { PaginatedData } from "@/types/api"

export default function RatingsPage() {
  usePageTitle("Rating")
  const [page, setPage] = React.useState(1)
  const { data, isLoading, isError, refetch } = useMyRatings({ page, limit: DEFAULT_PAGE_SIZE })

  const paginated = data as PaginatedData<Rating> | undefined

  const columns: DataTableColumn<Rating>[] = [
    {
      key: "stars",
      header: "Rating",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {([0, 1, 2, 3, 4] as const).map((i) => (
            <Star key={i} weight={i < row.stars ? "fill" : "regular"} className={`size-4 ${i < row.stars ? "text-amber-400" : "text-muted-foreground/30"}`} />
          ))}
        </div>
      ),
    },
    { key: "giverRole", header: "Peran", cell: (row) => row.giverRole === "BUYER" ? "Pembeli" : "Penjual" },
    { key: "comment", header: "Komentar", cell: (row) => <span className="max-w-[250px] truncate text-sm">{row.comment || "-"}</span> },
    { key: "createdAt", header: "Waktu", cell: (row) => formatDateTime(row.createdAt) },
  ]

  if (isError) return <ErrorState title="Gagal Memuat Ulasan" onRetry={() => refetch()} />

  return (
    <PageTransition className="space-y-6">
      <PageHeader title="Ulasan & Rating" description="Ulasan yang Anda terima dari transaksi" />

      <DataTable
        columns={columns}
        data={paginated?.data ?? []}
        isLoading={isLoading}
        emptyTitle="Belum Ada Ulasan"
        emptyDescription="Anda belum memiliki ulasan dari transaksi."
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
    </PageTransition>
  )
}
