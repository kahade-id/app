"use client"

import { StatusBadge } from "@/components/shared"
import type { DataTableColumn } from "@/components/shared"
import { formatIDR } from "@/lib/currency"
import { formatRelative, formatDateTime } from "@/lib/date"
import { WALLET_TX_LABELS, WALLET_TX_STATUS_LABELS } from "@/lib/constants"
import type { WalletTransaction, WalletTransactionType } from "@/types/wallet"

const DEBIT_TYPES = new Set<WalletTransactionType>([
  "WITHDRAW", "ORDER_LOCK", "SUBSCRIPTION_PAYMENT", "FEE_DEDUCT", "ADMIN_DEBIT",
])

export function isDebitTransaction(type: WalletTransactionType): boolean {
  return DEBIT_TYPES.has(type)
}

export function getWalletSummaryColumns(): DataTableColumn<WalletTransaction>[] {
  return [
    { key: "type", header: "Jenis", cell: (row) => WALLET_TX_LABELS[row.type] || row.type },
    { key: "amount", header: "Jumlah", cell: (row) => {
      // BUG-M06 FIX: Replaced hardcoded text-red-600 / text-emerald-600 with
      // semantic token (text-destructive) for debit and explicit dark: variant for
      // credit so both adapt to dark mode and custom palettes.
      const isDebit = isDebitTransaction(row.type)
      return (
        <span className={isDebit ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}>
          {isDebit ? "-" : "+"}{formatIDR(row.amount ?? 0)}
        </span>
      )
    }},
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} label={WALLET_TX_STATUS_LABELS[row.status]} /> },
    { key: "createdAt", header: "Waktu", cell: (row) => formatRelative(row.createdAt) },
  ]
}

export function getWalletHistoryColumns(): DataTableColumn<WalletTransaction>[] {
  return [
    { key: "txId", header: "ID Transaksi", cell: (row) => <span className="font-mono text-xs">{row.txId}</span>, className: "hidden md:table-cell" },
    { key: "type", header: "Jenis", cell: (row) => <span className="text-sm font-medium">{WALLET_TX_LABELS[row.type] || row.type}</span> },
    { key: "amount", header: "Jumlah", cell: (row) => <span className="font-medium">{formatIDR(row.amount ?? 0)}</span> },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} label={WALLET_TX_STATUS_LABELS[row.status]} /> },
    { key: "description", header: "Keterangan", cell: (row) => <span className="max-w-[200px] truncate text-sm text-muted-foreground">{row.description}</span>, className: "hidden lg:table-cell" },
    { key: "createdAt", header: "Waktu", cell: (row) => <span className="text-sm text-muted-foreground">{formatDateTime(row.createdAt)}</span>, className: "hidden sm:table-cell" },
  ]
}
