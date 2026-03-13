"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { LoadingState, ErrorState, EmptyState, PageHeader, ConfirmDialog, PageTransition } from "@/components/shared"
import { SessionCard } from "@/components/app/profile/SessionCard"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { useSessions, useRevokeSession, useRevokeOtherSessions } from "@/lib/hooks/use-sessions"
import type { UserSession } from "@/types/auth"

export default function SesiPage() {
  usePageTitle("Sesi Aktif")
  const { data: sessions, isLoading, isError, refetch } = useSessions()
  const revokeSession = useRevokeSession()
  const revokeAll = useRevokeOtherSessions()
  const [revokeId, setRevokeId] = React.useState<string | null>(null)
  const [showRevokeAll, setShowRevokeAll] = React.useState(false)

  if (isLoading) return <LoadingState fullPage text="Memuat sesi aktif..." />
  if (isError) return <ErrorState title="Gagal Memuat Sesi" onRetry={() => refetch()} />

  const sessionList = Array.isArray(sessions) ? sessions : []

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Sesi Aktif"
        description="Kelola sesi login di perangkat lain"
        action={
          sessionList.length > 1 ? (
            <Button variant="destructive" size="sm" onClick={() => setShowRevokeAll(true)} data-testid="button-revoke-all-sessions">
              Hapus Semua Sesi Lain
            </Button>
          ) : undefined
        }
      />

      {sessionList.length === 0 ? (
        <EmptyState title="Tidak Ada Sesi" description="Tidak ada sesi aktif ditemukan." />
      ) : (
        <div className="space-y-3">
          {sessionList.map((session: UserSession) => (
            <SessionCard
              key={session.id}
              session={session}
              onRevoke={(id) => setRevokeId(id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!revokeId}
        onOpenChange={(open) => !open && setRevokeId(null)}
        title="Hapus Sesi"
        description="Apakah Anda yakin ingin menghapus sesi ini? Perangkat tersebut akan logout."
        variant="destructive"
        confirmLabel="Hapus Sesi"
        onConfirm={() => { if (revokeId) revokeSession.mutate(revokeId, { onSuccess: () => setRevokeId(null) }) }}
        isLoading={revokeSession.isPending}
        confirmTestId="button-confirm-revoke-session"
        cancelTestId="button-cancel-revoke-session"
      />

      <ConfirmDialog
        open={showRevokeAll}
        onOpenChange={setShowRevokeAll}
        title="Hapus Semua Sesi Lain"
        description="Semua sesi selain sesi ini akan dihapus. Perangkat lain akan logout."
        variant="destructive"
        confirmLabel="Hapus Semua"
        onConfirm={() => revokeAll.mutate(undefined, { onSuccess: () => setShowRevokeAll(false) })}
        isLoading={revokeAll.isPending}
        confirmTestId="button-confirm-revoke-all-sessions"
        cancelTestId="button-cancel-revoke-all-sessions"
      />
    </PageTransition>
  )
}
