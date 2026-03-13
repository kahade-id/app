"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Monitor, DeviceMobile, Trash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingState, ErrorState, EmptyState, PageHeader, ConfirmDialog, PageTransition } from "@/components/shared"
import { useUserDevices, useRemoveDevice } from "@/lib/hooks/use-user"
import { formatDateTime, formatRelative } from "@/lib/date"
import { ROUTES } from "@/lib/constants"

export default function PerangkatPage() {
  const router = useRouter()
  const { data: devices, isLoading, isError, refetch } = useUserDevices()
  const removeDevice = useRemoveDevice()
  const [removeId, setRemoveId] = React.useState<string | null>(null)

  if (isLoading) return <LoadingState fullPage text="Memuat perangkat..." />
  if (isError) return <ErrorState title="Gagal Memuat Perangkat" onRetry={() => refetch()} />

  const deviceList = Array.isArray(devices) ? devices : []

  const isMobile = (platform?: string) =>
    platform?.toLowerCase().includes("mobile") ||
    platform?.toLowerCase().includes("android") ||
    platform?.toLowerCase().includes("ios")

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Kembali" className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80" onClick={() => router.push(ROUTES.PROFILE)} data-testid="button-devices-back">
            <ArrowLeft className="size-4" />
          </Button>
          <PageHeader
            title="Perangkat Saya"
            description="Kelola perangkat yang terhubung ke akun Anda"
          />
        </div>

        {deviceList.length === 0 ? (
          <EmptyState
            title="Tidak Ada Perangkat"
            description="Tidak ada perangkat yang terhubung ke akun Anda."
            icon={<Monitor className="size-8" />}
          />
        ) : (
          <div className="space-y-3">
            {deviceList.map((device) => (
              <Card key={device.id} className="transition-colors hover:border-foreground/20">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
                      {isMobile(device.platform) ? (
                        <DeviceMobile className="size-5 text-foreground/70" />
                      ) : (
                        <Monitor className="size-5 text-foreground/70" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium">{device.deviceName || "Perangkat tidak dikenal"}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span className="text-xs text-muted-foreground">{device.platform || "-"}</span>
                        <span className="hidden text-xs text-muted-foreground sm:inline">&middot;</span>
                        <span className="text-xs text-muted-foreground">Aktif {formatRelative(device.lastActiveAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Ditambahkan {formatDateTime(device.createdAt)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={() => setRemoveId(device.id)} data-testid={`button-remove-device-${device.id}`}>
                    <Trash className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <ConfirmDialog
          open={!!removeId}
          onOpenChange={(open) => !open && setRemoveId(null)}
          title="Hapus Perangkat"
          description="Apakah Anda yakin ingin menghapus perangkat ini? Perangkat tersebut akan terputus dari akun Anda."
          variant="destructive"
          confirmLabel="Hapus Perangkat"
          onConfirm={() => { if (removeId) removeDevice.mutate(removeId, { onSuccess: () => setRemoveId(null) }) }}
          confirmTestId="button-confirm-remove-device"
          cancelTestId="button-cancel-remove-device"
          isLoading={removeDevice.isPending}
        />
      </div>
    </PageTransition>
  )
}
