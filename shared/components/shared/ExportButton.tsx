"use client"

import { DownloadSimple } from "@phosphor-icons/react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

interface ExportButtonProps {
  onClick: () => void
  label?: string
  isLoading?: boolean
  className?: string
}

export function ExportButton({
  onClick,
  label = "Export",
  isLoading,
  className,
}: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isLoading}
      className={cn(className)}
    >
      <DownloadSimple className="size-4" />
      {label}
    </Button>
  )
}
