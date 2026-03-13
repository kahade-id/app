"use client"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../ui/input-otp"

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  // #4 FIX: Tambah prop `id` agar label htmlFor bisa terhubung ke input OTP
  id?: string
}

export function OTPInput({ value, onChange, length = 6, disabled, id }: OTPInputProps) {
  const half = Math.floor(length / 2)

  return (
    <InputOTP
      id={id}
      maxLength={length}
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-label="Masukkan kode OTP"
    >
      <InputOTPGroup>
        {Array.from({ length: half }).map((_, i) => (
          <InputOTPSlot key={i} index={i} aria-label={`Digit ${i + 1}`} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        {Array.from({ length: length - half }).map((_, i) => (
          <InputOTPSlot key={half + i} index={half + i} aria-label={`Digit ${half + i + 1}`} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}
