"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Buildings } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { LoadingState, ErrorState, EmptyState, PageHeader, ConfirmDialog, PageTransition } from "@/components/shared"
import { AddBankAccountForm, AddBankAccountTrigger } from "@/components/app/profile/AddBankAccountForm"
import { BankAccountCard } from "@/components/app/profile/BankAccountCard"
import { useBankAccounts, useDeleteBankAccount, useSetPrimaryBankAccount } from "@/lib/hooks/use-bank-accounts"
import { ROUTES } from "@/lib/constants"
import type { BankAccount } from "@/types/bank-account"

export default function RekeningPage() {
  const router = useRouter()
  const { data: accounts, isLoading, isError, refetch } = useBankAccounts()
  const deleteAccount = useDeleteBankAccount()
  const setPrimary = useSetPrimaryBankAccount()

  const [showAdd, setShowAdd] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const deleteAccount$ = deleteId ? accounts?.find((a: BankAccount) => a.id === deleteId) : null

  if (isLoading) return <LoadingState fullPage text="Memuat rekening bank..." />
  if (isError) return <ErrorState title="Gagal Memuat Rekening" onRetry={() => refetch()} />

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Kembali" className="shrink-0 rounded-xl border border-border bg-muted hover:bg-muted/80" onClick={() => router.push(ROUTES.PROFILE)} data-testid="button-bank-accounts-back">
            <ArrowLeft className="size-4" />
          </Button>
          <PageHeader
            title="Rekening Bank"
            description="Kelola rekening bank untuk penarikan dana"
            action={
              // #13 FIX: Pisahkan trigger dari dialog — gunakan AddBankAccountTrigger
              // di action slot dan AddBankAccountForm (controlled) terpisah
              <AddBankAccountTrigger onClick={() => setShowAdd(true)} />
            }
          />
        </div>

        {/* #13 FIX: Dialog sekarang fully controlled oleh parent state, tidak punya internal trigger */}
        <AddBankAccountForm open={showAdd} onOpenChange={setShowAdd} />

        {!accounts?.length ? (
          <EmptyState
            title="Belum Ada Rekening Bank"
            description="Tambahkan rekening bank untuk melakukan penarikan dana."
            icon={<Buildings className="size-8" />}
            action={<Button onClick={() => setShowAdd(true)} data-testid="button-add-bank-account-empty"><Plus className="mr-2 size-4" />Tambah Rekening</Button>}
          />
        ) : (
          <div className="space-y-3">
            {accounts.map((acc: BankAccount) => (
              <BankAccountCard
                key={acc.id}
                account={acc}
                onSetPrimary={(id) => setPrimary.mutate(id)}
                onDelete={(id) => setDeleteId(id)}
                isSetPrimaryPending={setPrimary.isPending}
              />
            ))}
          </div>
        )}

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Hapus Rekening Bank"
          description={deleteAccount$ ? `Apakah Anda yakin ingin menghapus rekening ${deleteAccount$.bankName} (${deleteAccount$.accountNumber}) atas nama ${deleteAccount$.accountName}?` : "Apakah Anda yakin ingin menghapus rekening bank ini?"}
          variant="destructive"
          confirmLabel="Hapus"
          onConfirm={() => { if (deleteId) deleteAccount.mutate(deleteId, { onSuccess: () => setDeleteId(null) }) }}
          confirmTestId="button-confirm-delete-bank"
          cancelTestId="button-cancel-delete-bank"
          isLoading={deleteAccount.isPending}
        />
      </div>
    </PageTransition>
  )
}
