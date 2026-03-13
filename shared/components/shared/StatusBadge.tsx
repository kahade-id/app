"use client"

import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"

type StatusVariant = "success" | "warning" | "danger" | "info" | "default" | "muted"

const STATUS_MAP: Record<string, StatusVariant> = {
  COMPLETED: "success",
  APPROVED: "success",
  SUCCESS: "success",
  RESOLVED: "success",
  ACTIVE: "success",

  WAITING_CONFIRMATION: "warning",
  WAITING_PAYMENT: "warning",
  PENDING: "warning",
  PENDING_OTP: "warning",
  PENDING_PROCESS: "warning",
  PROCESSING: "warning",
  OPEN: "warning",
  ASSIGNED: "info",
  UNDER_REVIEW: "info",
  WAITING_RESPONSE: "warning",
  IN_DELIVERY: "info",
  // M-01 FIX: Added missing statuses
  EXPIRED: "warning",
  REFUNDED: "info",

  CANCELLED: "danger",
  REJECTED: "danger",
  FAILED: "danger",
  DISPUTED: "danger",
  ESCALATED: "danger",
  REVOKED: "danger",
  SUSPENDED: "danger",
  BANNED: "danger",

  UNVERIFIED: "muted",
  REVERSED: "muted",
}

// M-25 FIX: Fallback Indonesian labels for common statuses
// (used when no explicit `label` prop is passed)
const STATUS_LABELS_ID: Record<string, string> = {
  WAITING_CONFIRMATION: 'Menunggu Konfirmasi',
  WAITING_PAYMENT: 'Menunggu Pembayaran',
  PROCESSING: 'Diproses',
  IN_DELIVERY: 'Dalam Pengiriman',
  COMPLETED: 'Selesai',
  DISPUTED: 'Dalam Sengketa',
  CANCELLED: 'Dibatalkan',
  APPROVED: 'Terverifikasi',
  REJECTED: 'Ditolak',
  PENDING: 'Tertunda',
  PENDING_OTP: 'Menunggu OTP',
  PENDING_PROCESS: 'Menunggu Proses',
  SUCCESS: 'Berhasil',
  FAILED: 'Gagal',
  EXPIRED: 'Kedaluwarsa',
  REFUNDED: 'Dikembalikan',
  REVERSED: 'Dikembalikan',
  RESOLVED: 'Selesai',
  OPEN: 'Terbuka',
  ASSIGNED: 'Ditugaskan',
  UNDER_REVIEW: 'Dalam Review',
  WAITING_RESPONSE: 'Menunggu Respons',
  ESCALATED: 'Dieskalasi',
  UNVERIFIED: 'Belum Terverifikasi',
  REVOKED: 'Dicabut',
  ACTIVE: 'Aktif',
  SUSPENDED: 'Ditangguhkan',
  BANNED: 'Diblokir',
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  danger: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  default: "bg-primary/5 text-primary border-primary/20",
  muted: "bg-muted text-muted-foreground border-border",
}

const DOT_COLORS: Record<StatusVariant, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  default: "bg-primary",
  muted: "bg-muted-foreground/50",
}

interface StatusBadgeProps {
  status: string
  label?: string
  variant?: StatusVariant
  className?: string
  pulse?: boolean
}

export function StatusBadge({ status, label, variant, className, pulse }: StatusBadgeProps) {
  const resolvedVariant = variant ?? STATUS_MAP[status] ?? "default"
  // M-25 FIX: Use Indonesian label fallback before raw status
  const displayLabel = label ?? STATUS_LABELS_ID[status] ?? status.replace(/_/g, " ")

  return (
    <Badge
      variant="outline"
      title={displayLabel}
      className={cn(
        "gap-1.5 px-2.5 py-0.5 font-medium",
        VARIANT_CLASSES[resolvedVariant],
        pulse && "animate-pulse",
        className
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", DOT_COLORS[resolvedVariant])} />
      {displayLabel}
    </Badge>
  )
}
