"use client"

import { Wallet } from "@phosphor-icons/react"
import { Card, CardContent } from "@/components/ui/card"
import { formatIDR } from "@/lib/currency"
import type { Wallet as WalletType } from "@/types/wallet"

interface WalletBalanceCardProps {
  wallet: WalletType
}

export function WalletBalanceCard({ wallet }: WalletBalanceCardProps) {
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <Wallet className="size-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary-foreground/90">Saldo Tersedia</p>
            <p className="text-3xl font-bold tracking-tight">{formatIDR(wallet.availableBalance)}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-primary-foreground/15 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/80">Dana Escrow</p>
            <p className="mt-1 text-lg font-semibold">{formatIDR(wallet.escrowBalance)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/80">Total Saldo</p>
            <p className="mt-1 text-lg font-semibold">{formatIDR(wallet.totalBalance)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
