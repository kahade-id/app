"use client"

import { cn } from "../../lib/utils"
import { Warning } from "@phosphor-icons/react"
import { Button } from "../ui/button"

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  /** #291 — Display error code for debugging / support */
  errorCode?: string
  className?: string
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  description = "Gagal memuat data. Silakan coba lagi.",
  onRetry,
  errorCode,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" aria-live="assertive" className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div
        className="mb-5 flex size-20 items-center justify-center rounded-2xl border border-dashed border-destructive/20 bg-destructive/5 text-destructive"
        aria-hidden="true"
      >
        <Warning className="size-8" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>
      {errorCode && (
        <p className="mt-1 font-mono text-xs text-muted-foreground/60">Kode error: {errorCode}</p>
      )}
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-5">
          Coba Lagi
        </Button>
      )}
    </div>
  )
}
