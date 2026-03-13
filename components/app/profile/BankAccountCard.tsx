"use client"

import * as React from "react"
import { Star, Trash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/shared"
import type { BankAccount } from "@/types/bank-account"

interface BankAccountCardProps {
  account: BankAccount
  onSetPrimary: (id: string) => void
  onDelete: (id: string) => void
  isSetPrimaryPending?: boolean
}

export function BankAccountCard({ account, onSetPrimary, onDelete, isSetPrimaryPending }: BankAccountCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  return (
    <>
      <Card className={account.isPrimary ? "border-primary/30" : ""}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
              <span className="text-xs font-bold text-foreground/70">{account.bankCode?.slice(0, 3) || account.bankName?.slice(0, 2)}</span>
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{account.bankName}</p>
                {account.isPrimary && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    <Star className="size-3" />
                    Utama
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{account.accountNumber} &middot; {account.accountName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!account.isPrimary && (
              <Button variant="ghost" size="sm" className="text-xs hover:bg-muted/50" onClick={() => onSetPrimary(account.id)} disabled={isSetPrimaryPending} data-testid={`button-set-primary-${account.id}`}>
                Jadikan Utama
              </Button>
            )}
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={() => setShowDeleteConfirm(true)} data-testid={`button-delete-bank-${account.id}`}>
              <Trash className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Hapus Rekening Bank"
        description={`Apakah Anda yakin ingin menghapus rekening ${account.bankName} - ${account.accountNumber}?`}
        variant="destructive"
        confirmLabel="Hapus"
        onConfirm={() => {
          onDelete(account.id)
          setShowDeleteConfirm(false)
        }}
      />
    </>
  )
}
