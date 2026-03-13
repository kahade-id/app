"use client"

// L-02 FIX: PasswordInput extracted to a shared component.
// Previously TwoFASetupModal imported PasswordInput from ChangePasswordForm.tsx —
// coupling an unrelated component to an internal implementation detail.
// Shared components belong here so any feature can import without circular deps.

import * as React from "react"
import { Eye, EyeSlash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PasswordInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  id?: string
  disabled?: boolean
  autoComplete?: string
  "data-testid"?: string
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Masukkan password",
  id,
  disabled,
  autoComplete = "current-password",
  "data-testid": dataTestId,
}: PasswordInputProps) {
  const [show, setShow] = React.useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className="pr-10"
        data-testid={dataTestId}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        onClick={() => setShow(!show)}
        tabIndex={-1}
        disabled={disabled}
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
      >
        {show
          ? <EyeSlash className="size-4 text-muted-foreground" />
          : <Eye className="size-4 text-muted-foreground" />
        }
      </Button>
    </div>
  )
}
