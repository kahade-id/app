"use client"

import * as React from "react"
import { UserMinus, Trash, GearSix, Shield, Bell, Globe, FileText } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingState, ErrorState, EmptyState, PageHeader, ConfirmDialog, PageTransition, StatusBadge } from "@/components/shared"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { usePrivacySettings, useUpdatePrivacySettings, useBlockedList, useUnblockUser, useMyReports } from "@/lib/hooks/use-settings"
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/lib/hooks/use-notifications"
import { formatRelative } from "@/lib/date"
import { toast } from "sonner"

// M-16 NOTE: These label keys must stay in sync with the NotificationPreference type
// (types/notification.ts) and the backend API response. If the backend adds or renames
// preference keys, update this map accordingly — a mismatch causes silent label fallback
// where the toggle renders but with no label text, confusing the user.
const NOTIF_PREF_LABELS: Record<string, { label: string; description: string }> = {
  orderInApp: { label: "Pesanan (In-App)", description: "Notifikasi pesanan di aplikasi" },
  orderEmail: { label: "Pesanan (Email)", description: "Notifikasi pesanan via email" },
  walletInApp: { label: "Dompet (In-App)", description: "Notifikasi dompet di aplikasi" },
  walletEmail: { label: "Dompet (Email)", description: "Notifikasi dompet via email" },
  securityInApp: { label: "Keamanan (In-App)", description: "Notifikasi keamanan di aplikasi" },
  securityEmail: { label: "Keamanan (Email)", description: "Notifikasi keamanan via email" },
  chatInApp: { label: "Chat (In-App)", description: "Notifikasi chat di aplikasi" },
  disputeInApp: { label: "Sengketa (In-App)", description: "Notifikasi sengketa di aplikasi" },
  disputeEmail: { label: "Sengketa (Email)", description: "Notifikasi sengketa via email" },
  rankingInApp: { label: "Peringkat (In-App)", description: "Notifikasi peringkat di aplikasi" },
  marketingEmail: { label: "Promosi (Email)", description: "Notifikasi promosi via email" },
}

const REPORT_STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "muted" }> = {
  PENDING: { label: "Menunggu", variant: "warning" },
  REVIEWING: { label: "Ditinjau", variant: "default" },
  RESOLVED: { label: "Selesai", variant: "success" },
  REJECTED: { label: "Ditolak", variant: "danger" },
}

const REPORT_CATEGORY_LABELS: Record<string, string> = {
  FRAUD: "Penipuan",
  HARASSMENT: "Pelecehan",
  SPAM: "Spam",
  INAPPROPRIATE: "Konten Tidak Pantas",
  SCAM: "Scam",
  FAKE_ACCOUNT: "Akun Palsu",
  OTHER: "Lainnya",
}

export default function PengaturanPage() {
  usePageTitle("Pengaturan")
  const { data: privacy, isLoading: privacyLoading, isError: privacyError, refetch: refetchPrivacy } = usePrivacySettings()
  const updatePrivacy = useUpdatePrivacySettings()
  const { data: blocked, isLoading: blockedLoading, isError: blockedError, refetch: refetchBlocked } = useBlockedList()
  const unblock = useUnblockUser()
  const [unblockId, setUnblockId] = React.useState<string | null>(null)

  const { data: notifPrefs, isLoading: notifLoading, isError: notifError, refetch: refetchNotif } = useNotificationPreferences()
  const updateNotifPrefs = useUpdateNotificationPreferences()

  const { data: reportsData, isLoading: reportsLoading, isError: reportsError, refetch: refetchReports } = useMyReports()

  const reports = reportsData?.data ?? []

  const [pendingNotifChanges, setPendingNotifChanges] = React.useState<Record<string, boolean>>({})
  const [pendingPrivacyChanges, setPendingPrivacyChanges] = React.useState<Record<string, boolean>>({})

  const hasPendingChanges = Object.keys(pendingNotifChanges).length > 0 || Object.keys(pendingPrivacyChanges).length > 0

  const handleNotifToggle = (key: string, value: boolean) => {
    setPendingNotifChanges((prev) => {
      const original = notifPrefs?.[key as keyof typeof notifPrefs]
      if (original === value) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: value }
    })
  }

  const handlePrivacyToggle = (key: string, value: boolean) => {
    setPendingPrivacyChanges((prev) => {
      const original = privacy?.[key as keyof typeof privacy]
      if (original === value) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: value }
    })
  }

  const handleSaveAll = () => {
    const promises: Promise<unknown>[] = []
    if (Object.keys(pendingNotifChanges).length > 0) {
      promises.push(
        new Promise((resolve, reject) => {
          updateNotifPrefs.mutate(pendingNotifChanges, {
            onSuccess: () => resolve(undefined),
            onError: (err) => reject(err),
          })
        })
      )
    }
    if (Object.keys(pendingPrivacyChanges).length > 0) {
      promises.push(
        new Promise((resolve, reject) => {
          updatePrivacy.mutate(pendingPrivacyChanges, {
            onSuccess: () => resolve(undefined),
            onError: (err) => reject(err),
          })
        })
      )
    }
    Promise.allSettled(promises)
      .then((results) => {
        const failures = results.filter((r) => r.status === "rejected")
        if (failures.length === 0) {
          setPendingNotifChanges({})
          setPendingPrivacyChanges({})
          toast.success("Pengaturan berhasil disimpan")
        } else if (failures.length < results.length) {
          if (results[0]?.status === "fulfilled") setPendingNotifChanges({})
          if (results.length > 1 && results[1]?.status === "fulfilled") setPendingPrivacyChanges({})
          toast.warning("Sebagian pengaturan gagal disimpan. Silakan coba lagi.")
        } else {
          toast.error("Gagal menyimpan pengaturan")
        }
      })
  }

  const getNotifValue = (key: string) => {
    if (key in pendingNotifChanges) return pendingNotifChanges[key]
    return notifPrefs?.[key as keyof typeof notifPrefs] ?? false
  }

  const getPrivacyValue = (key: string) => {
    if (key in pendingPrivacyChanges) return pendingPrivacyChanges[key]
    return (privacy as Record<string, boolean> | undefined)?.[key] ?? false
  }

  React.useEffect(() => {
    if (!hasPendingChanges) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [hasPendingChanges])

  if (privacyLoading) return <LoadingState fullPage text="Memuat pengaturan..." />
  if (privacyError) return <ErrorState title="Gagal Memuat Pengaturan" onRetry={() => refetchPrivacy()} />

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Pengaturan" description="Kelola privasi dan preferensi akun" />
        {hasPendingChanges && (
          <Button onClick={handleSaveAll} disabled={updateNotifPrefs.isPending || updatePrivacy.isPending} data-testid="button-save-settings">
            {updateNotifPrefs.isPending || updatePrivacy.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        )}
      </div>

      <Card className="py-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
              <Bell className="size-5 text-foreground/70" />
            </div>
            <div>
              <CardTitle>Preferensi Notifikasi</CardTitle>
              <CardDescription>Atur notifikasi yang ingin Anda terima</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notifLoading ? (
            <LoadingState text="Memuat preferensi..." />
          ) : notifError ? (
            <ErrorState onRetry={() => refetchNotif()} />
          ) : (
            <div className="space-y-1">
              {Object.entries(NOTIF_PREF_LABELS).map(([key, { label, description }]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border p-3.5 transition-colors hover:bg-muted/30">
                  <div className="space-y-0.5">
                    <Label htmlFor={`notif-${key}`} className="cursor-pointer text-sm font-medium">{label}</Label>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    id={`notif-${key}`}
                    checked={getNotifValue(key) as boolean}
                    onCheckedChange={(v) => handleNotifToggle(key, v)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
              <Globe className="size-5 text-foreground/70" />
            </div>
            <div>
              <CardTitle>Bahasa</CardTitle>
              <CardDescription>Pilih bahasa yang digunakan di aplikasi</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-2.5">
              <span className="text-sm font-medium">Bahasa Indonesia</span>
            </div>
            <span className="text-xs text-muted-foreground">Dukungan bahasa lain segera hadir</span>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
              <Shield className="size-5 text-foreground/70" />
            </div>
            <div>
              <CardTitle>Pengaturan Privasi</CardTitle>
              <CardDescription>Kontrol siapa yang bisa melihat informasi Anda</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between rounded-lg border border-border p-3.5 transition-colors hover:bg-muted/30">
            <Label htmlFor="showProfile" className="cursor-pointer text-sm font-medium">Tampilkan Profil Publik</Label>
            <Switch
              id="showProfile"
              checked={getPrivacyValue("showProfile") as boolean}
              onCheckedChange={(v) => handlePrivacyToggle("showProfile", v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3.5 transition-colors hover:bg-muted/30">
            <Label htmlFor="showRatings" className="cursor-pointer text-sm font-medium">Tampilkan Rating</Label>
            <Switch
              id="showRatings"
              checked={getPrivacyValue("showRatings") as boolean}
              onCheckedChange={(v) => handlePrivacyToggle("showRatings", v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3.5 transition-colors hover:bg-muted/30">
            <Label htmlFor="showOrderCount" className="cursor-pointer text-sm font-medium">Tampilkan Jumlah Transaksi</Label>
            <Switch
              id="showOrderCount"
              checked={getPrivacyValue("showOrderCount") as boolean}
              onCheckedChange={(v) => handlePrivacyToggle("showOrderCount", v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
              <UserMinus className="size-5 text-foreground/70" />
            </div>
            <div>
              <CardTitle>Pengguna Diblokir</CardTitle>
              <CardDescription>Pengguna yang telah Anda blokir tidak bisa bertransaksi dengan Anda</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {blockedLoading ? (
            <LoadingState text="Memuat..." />
          ) : blockedError ? (
            <ErrorState onRetry={() => refetchBlocked()} />
          ) : !blocked?.length ? (
            <EmptyState
              title="Tidak Ada Pengguna Diblokir"
              description="Anda belum memblokir siapa pun."
              icon={<UserMinus className="size-8" />}
            />
          ) : (
            <div className="space-y-2">
              {blocked.map((blockedUser) => (
                <div key={blockedUser.id} className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold uppercase">
                      {(blockedUser.fullName || "?").charAt(0)}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold">{blockedUser.fullName}</p>
                      <p className="text-xs text-muted-foreground">@{blockedUser.username || "-"} · Diblokir {formatRelative(blockedUser.blockedAt)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" onClick={() => setUnblockId(blockedUser.userId ?? blockedUser.id)} data-testid={`button-unblock-${blockedUser.userId ?? blockedUser.id}`}>
                    <UserMinus className="mr-1.5 size-4" />
                    Buka Blokir
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
              <FileText className="size-5 text-foreground/70" />
            </div>
            <div>
              <CardTitle>Laporan Saya</CardTitle>
              <CardDescription>Riwayat laporan pengguna yang Anda kirim</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <LoadingState text="Memuat laporan..." />
          ) : reportsError ? (
            <ErrorState onRetry={() => refetchReports()} />
          ) : !reports?.length ? (
            <EmptyState
              title="Belum Ada Laporan"
              description="Anda belum mengirim laporan apa pun."
              icon={<FileText className="size-8" />}
            />
          ) : (
            <div className="space-y-2">
              {reports.map((report: { id: string; targetName: string; category: string; description: string; status: string; createdAt: string }) => {
                const statusInfo = REPORT_STATUS_MAP[report.status] ?? { label: report.status, variant: "muted" as const }
                return (
                  <div key={report.id} className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{report.targetName}</p>
                        <p className="text-xs text-muted-foreground">{REPORT_CATEGORY_LABELS[report.category] || report.category} · {formatRelative(report.createdAt)}</p>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                      <StatusBadge status={statusInfo.label} variant={statusInfo.variant} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!unblockId}
        onOpenChange={(open) => !open && setUnblockId(null)}
        title="Buka Blokir Pengguna"
        description="Apakah Anda yakin ingin membuka blokir pengguna ini?"
        confirmLabel="Buka Blokir"
        onConfirm={() => { if (unblockId) unblock.mutate(unblockId, { onSuccess: () => setUnblockId(null) }) }}
        isLoading={unblock.isPending}
        confirmTestId="button-confirm-unblock-user"
        cancelTestId="button-cancel-unblock-user"
      />

      {hasPendingChanges && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 backdrop-blur-sm sm:bottom-4 sm:left-auto sm:right-4 sm:w-auto sm:rounded-lg sm:border sm:shadow-lg">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 sm:mx-0">
            <p className="text-sm text-muted-foreground">Anda memiliki perubahan yang belum disimpan</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setPendingNotifChanges({}); setPendingPrivacyChanges({}) }} data-testid="button-discard-settings">
                Batal
              </Button>
              <Button size="sm" onClick={handleSaveAll} disabled={updateNotifPrefs.isPending || updatePrivacy.isPending} data-testid="button-save-settings-sticky">
                {updateNotifPrefs.isPending || updatePrivacy.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  )
}
