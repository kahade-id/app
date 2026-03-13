"use client"

import * as React from "react"
import { Ticket, Tag, Clock, Percent, Gift } from "@phosphor-icons/react"
import { PageHeader, ErrorState, LoadingState, EmptyState, PageTransition, CopyButton } from "@/components/shared"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useAvailableVouchers, useMyVoucherUsage } from "@/lib/hooks/use-voucher"
import { formatIDR } from "@/lib/currency"
import { formatDateTime, formatDate } from "@/lib/date"

const APPLICABILITY_LABELS: Record<string, string> = {
  ALL: "Semua",
  BUYER_ONLY: "Pembeli",
  SELLER_ONLY: "Penjual",
  NEW_USER: "Pengguna Baru",
}

export default function VoucherPage() {
  usePageTitle("Voucher")
  const { data: availableData, isLoading: availableLoading, isError: availableError, refetch: refetchAvailable } = useAvailableVouchers()
  const { data: usageData, isLoading: usageLoading, isError: usageError, refetch: refetchUsage } = useMyVoucherUsage()

  const availableItems = availableData?.data ?? []
  const usageItems = usageData?.data ?? []

  return (
    <PageTransition className="space-y-6">
      <PageHeader title="Voucher" description="Voucher diskon yang tersedia untuk Anda" />

      <Tabs defaultValue="tersedia">
        <TabsList>
          <TabsTrigger value="tersedia">Tersedia</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Penggunaan</TabsTrigger>
        </TabsList>

        <TabsContent value="tersedia" className="mt-4 space-y-4">
          {availableLoading && <LoadingState />}
          {availableError && <ErrorState title="Gagal Memuat Voucher" onRetry={() => refetchAvailable()} />}
          {!availableLoading && !availableError && availableItems.length === 0 && (
            <EmptyState icon={<Gift className="size-8" />} title="Belum Ada Voucher" description="Tidak ada voucher yang tersedia saat ini. Periksa kembali nanti untuk penawaran terbaru!" />
          )}
          {!availableLoading && !availableError && availableItems.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {availableItems.map((voucher) => (
                <Card key={voucher.id} className="py-0 transition-colors hover:border-foreground/20">
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      <div className="flex w-20 shrink-0 items-center justify-center border-r border-dashed border-border bg-muted/30">
                        <Ticket className="size-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold">{voucher.name || voucher.code}</p>
                          {voucher.applicableTo && (
                            <Badge variant="secondary" className="shrink-0 text-xs">{APPLICABILITY_LABELS[voucher.applicableTo] || voucher.applicableTo}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="rounded-md border border-dashed border-border bg-muted/50 px-2.5 py-1 font-mono text-xs font-semibold tracking-wider">{voucher.code}</code>
                          <CopyButton value={voucher.code} variant="ghost" size="icon-sm" />
                        </div>
                        {voucher.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{voucher.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Percent className="size-3.5" />
                            {voucher.discountPercent
                              ? `${voucher.discountPercent}%`
                              : voucher.discountAmount
                                ? formatIDR(voucher.discountAmount)
                                : "-"}
                            {voucher.maxDiscountAmount != null && ` (maks. ${formatIDR(voucher.maxDiscountAmount)})`}
                          </span>
                          {(voucher.validFrom || voucher.validUntil) && (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5" />
                              {`${voucher.validFrom ? formatDate(voucher.validFrom) : "—"} - ${voucher.validUntil ? formatDate(voucher.validUntil) : "—"}`}
                            </span>
                          )}
                        </div>
                        {(voucher.minOrderValue > 0) && (
                          <p className="text-xs text-muted-foreground">
                            Min. transaksi: {formatIDR(voucher.minOrderValue)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="riwayat" className="mt-4 space-y-4">
          {usageLoading && <LoadingState />}
          {usageError && <ErrorState title="Gagal Memuat Riwayat" onRetry={() => refetchUsage()} />}
          {!usageLoading && !usageError && usageItems.length === 0 && (
            <EmptyState icon={<Ticket className="size-8" />} title="Belum Ada Riwayat" description="Anda belum menggunakan voucher." />
          )}
          {!usageLoading && !usageError && usageItems.length > 0 && (
            <div className="space-y-2">
              {usageItems.map((usage) => (
                <div key={usage.id} className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
                      <Ticket className="size-5 text-foreground/70" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold">{usage.voucherCode}</p>
                      {usage.orderId && (
                        <p className="text-xs text-muted-foreground">Order: {usage.orderId}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-sm font-semibold text-emerald-600">-{formatIDR(usage.discountAmount)}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(usage.usedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageTransition>
  )
}
