"use client"

import * as React from "react"
import { Check, Copy } from "@phosphor-icons/react"
import { Button } from "../ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { cn } from "../../lib/utils"

interface CopyButtonProps {
  value: string
  className?: string
  variant?: "ghost" | "outline"
  size?: "icon" | "icon-sm"
}

export function CopyButton({ value, className, variant = "ghost", size = "icon-sm" }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      try {
        const textarea = document.createElement("textarea")
        textarea.value = value
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        import("sonner").then(({ toast }) => {
          toast.error("Gagal menyalin teks")
        })
      }
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={cn(className)}
          onClick={handleCopy}
          aria-label="Salin"
        >
          {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? "Tersalin!" : "Salin"}</TooltipContent>
    </Tooltip>
  )
}
