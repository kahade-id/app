"use client"

import { cn } from "../../lib/utils"
import { Warning, Info, CheckCircle, XCircle, X } from "@phosphor-icons/react"

type AlertVariant = "info" | "success" | "warning" | "error"

const VARIANT_STYLES: Record<AlertVariant, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/50 dark:bg-blue-950/30 dark:text-blue-300",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300",
  warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300",
  error: "border-destructive/30 bg-destructive/5 text-destructive dark:border-destructive/50 dark:bg-destructive/10 dark:text-red-300",
}

const VARIANT_ICONS: Record<AlertVariant, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: Warning,
  error: XCircle,
}

interface AlertBannerProps {
  variant?: AlertVariant
  title?: string
  message: string
  onClose?: () => void
  closeLabel?: string
  className?: string
  action?: React.ReactNode
}

export function AlertBanner({
  variant = "info",
  title,
  message,
  onClose,
  closeLabel = "Tutup",
  className,
  action,
}: AlertBannerProps) {
  const Icon = VARIANT_ICONS[variant]

  return (
    <div role={variant === "error" ? "alert" : "status"} className={cn("flex items-start gap-3 rounded-lg border p-4", VARIANT_STYLES[variant], className)}>
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="flex-1 space-y-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        <p className="text-sm">{message}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label={closeLabel} className="shrink-0 rounded-sm opacity-70 hover:opacity-100">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
