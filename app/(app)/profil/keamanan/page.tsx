"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, ShieldCheck, Trash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { LoadingState, ErrorState, PageHeader, PageTransition, PasswordInput } from "@/components/shared"
import { ChangePasswordForm } from "@/components/app/profile/ChangePasswordForm"
import { TwoFASetupModal } from "@/components/app/profile/TwoFASetupModal"
import { TwoFADisableModal } from "@/components/app/profile/TwoFADisableModal"
import { useMe, useDeleteRequest } from "@/lib/hooks/use-user"
import { useAuthStore } from "@/lib/stores/auth.store"
import { ROUTES } from "@/lib/constants"

export default function KeamananPage() {
  const router = useRouter()
  const { data: user, isLoading, isError, refetch } = useMe()
  const deleteRequest = useDeleteRequest()
  const logout = useAuthStore((s) => s.logout)

  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [deletePassword, setDeletePassword] = React.useState("")
  const [deleteReason, setDeleteReason] = React.useState("")

  const handleDeleteAccount = () => {
    if (!deletePassword.trim()) return
    deleteRequest.mutate(
      { password: deletePassword, reason: deleteReason.trim() || undefined },
      {
        onSuccess: async () => {
          setShowDeleteDialog(false)
          await logout()
          router.push(ROUTES.LOGIN)
        },
      }
    )
  }

  if (isLoading) return <LoadingState fullPage text="Memuat..." />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Kembali" className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80" onClick={() => router.push(ROUTES.PROFILE)} data-testid="button-security-back">
            <ArrowLeft className="size-4" />
          </Button>
          <PageHeader title="Keamanan Akun" description="Kelola password dan autentikasi dua faktor" />
        </div>

        <ChangePasswordForm />

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-xl border border-border ${user?.isMfaEnabled ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-muted"}`}>
                {user?.isMfaEnabled ? <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" /> : <Shield className="size-5 text-muted-foreground" />}
              </div>
              <div>
                <CardTitle>Autentikasi Dua Faktor (2FA)</CardTitle>
                <CardDescription className="mt-1">
                  {user?.isMfaEnabled ? "2FA aktif. Akun Anda lebih aman." : "Aktifkan 2FA untuk keamanan tambahan."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.isMfaEnabled ? (
              <TwoFADisableModal />
            ) : (
              <TwoFASetupModal />
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10">
                <Trash className="size-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-destructive">Hapus Akun</CardTitle>
                <CardDescription className="mt-1">
                  Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive/90 space-y-1.5">
              <p className="font-medium">Yang akan terjadi jika Anda menghapus akun:</p>
              <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
                <li>Semua data akun Anda akan dihapus secara permanen</li>
                <li>Saldo wallet yang tersisa tidak dapat dikembalikan</li>
                <li>Semua transaksi aktif akan dibatalkan</li>
                <li>Anda tidak dapat mendaftar ulang dengan email yang sama</li>
              </ul>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              data-testid="button-request-delete-account"
            >
              <Trash className="mr-2 size-4" />
              Ajukan Penghapusan Akun
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Hapus Akun</DialogTitle>
            <DialogDescription>
              Masukkan password Anda untuk mengkonfirmasi penghapusan akun. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="delete-password">Password</Label>
              <PasswordInput
                id="delete-password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Masukkan password Anda"
                autoComplete="current-password"
                data-testid="input-delete-account-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-reason">Alasan (opsional)</Label>
              <Textarea
                id="delete-reason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Mengapa Anda ingin menghapus akun?"
                rows={3}
                maxLength={500}
                data-testid="textarea-delete-account-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeletePassword("")
                setDeleteReason("")
              }}
              disabled={deleteRequest.isPending}
              data-testid="button-cancel-delete-account"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteRequest.isPending || !deletePassword.trim()}
              data-testid="button-confirm-delete-account"
            >
              {deleteRequest.isPending ? "Memproses..." : "Hapus Akun Saya"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}
