"use client"

import * as React from "react"
import { Input } from "../ui/input"
import { formatIDRInput, parseIDR } from "../../lib/currency"
import { cn } from "../../lib/utils"

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  onBlur?: () => void
  min?: number
  max?: number
  className?: string
  disabled?: boolean
  placeholder?: string
  /** If true, clamp to min/max on blur. Default: false (let Zod schema validate) */
  clampOnBlur?: boolean
  "data-testid"?: string
}

export function CurrencyInput({
  value,
  onChange,
  onBlur,
  min = 0,
  max,
  className,
  disabled,
  placeholder = "0",
  clampOnBlur = false,
  "data-testid": dataTestId,
}: CurrencyInputProps) {
  const [display, setDisplay] = React.useState(() =>
    value !== 0 ? formatIDRInput(value) : ""
  )

  React.useEffect(() => {
    const currentParsed = parseIDR(display)
    if (currentParsed !== value) {
      setDisplay(value !== 0 ? formatIDRInput(value) : "")
    }
    // intentionally only tracking `value` — `display` is local state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "")
    if (!raw) {
      setDisplay("")
      onChange(0)
      return
    }
    const num = parseInt(raw, 10)
    // C-05 FIX: Do NOT clamp to min while user is still typing.
    // Only apply max cap to prevent absurdly large numbers.
    const capped = max !== undefined ? Math.min(num, max) : num
    setDisplay(formatIDRInput(capped))
    onChange(capped)
  }

  const handleBlur = () => {
    // H-19: Clamp to valid range on blur (if opt-in)
    if (clampOnBlur && value < min) {
      setDisplay(formatIDRInput(min))
      onChange(min)
    } else if (clampOnBlur && max !== undefined && value > max) {
      setDisplay(formatIDRInput(max))
      onChange(max)
    }
    onBlur?.()
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        Rp
      </span>
      <Input
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn("pl-9", className)}
        disabled={disabled}
        placeholder={placeholder}
        inputMode="numeric"
        data-testid={dataTestId}
      />
    </div>
  )
}
