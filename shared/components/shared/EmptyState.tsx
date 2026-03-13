"use client"

import { cn } from "../../lib/utils"
import { Tray } from "@phosphor-icons/react"

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  /** #292 — CTA button or any action element */
  action?: React.ReactNode
  /** Optional error code for debugging (#291) */
  errorCode?: string
  className?: string
}

export function EmptyState({
  title = "Tidak ada data",
  description = "Belum ada data untuk ditampilkan.",
  icon,
  action,
  errorCode,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center justify-center py-16 text-center", className)}
    >
      <div
        className="mb-5 flex size-20 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50 text-muted-foreground"
        aria-hidden="true"
      >
        {icon ?? <Tray className="size-8" />}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>
      {errorCode && (
        <p className="mt-1 text-xs text-muted-foreground/60 font-mono">Kode: {errorCode}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
