"use client"

import * as React from "react"
import { Input } from "../ui/input"
import { cn } from "../../lib/utils"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  prefix?: string
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function PhoneInput({
  value,
  onChange,
  prefix = "+62",
  className,
  disabled,
  placeholder = "812xxxxxxxx",
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "")
    onChange(raw)
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        {prefix}
      </span>
      <Input
        type="tel"
        value={value}
        onChange={handleChange}
        className={cn("pl-12", className)}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={13}
        inputMode="tel"
      />
    </div>
  )
}
