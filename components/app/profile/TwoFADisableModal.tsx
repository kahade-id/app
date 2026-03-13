"use client"

import * as React from "react"
import { ShieldCheck, ShieldSlash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { OTPInput } from "@/components/shared"
import { useRequestDisable2FAOtp, useDisable2FA } from "@/lib/hooks/use-auth"

interface TwoFADisableModalProps {
  onComplete?: () => void
}

export function TwoFADisableModal({ onComplete }: TwoFADisableModalProps) {
  const requestDisableOtp = useRequestDisable2FAOtp()
  const disable2FA = useDisable2FA()

  const [showDisable, setShowDisable] = React.useState(false)
  const [disableCode, setDisableCode] = React.useState("")
  const [disableOtp, setDisableOtp] = React.useState("")

  const handleRequestDisableOtp = () => {
    requestDisableOtp.mutate(undefined, {
      onSuccess: () => setShowDisable(true),
    })
  }

  const handleCancelDisable = () => {
    setShowDisable(false)
    setDisableCode("")
    setDisableOtp("")
  }

  const handleDisable2FA = () => {
    disable2FA.mutate(
      { code: disableCode, emailOtpCode: disableOtp },
      {
        onSuccess: () => {
          setShowDisable(false)
          setDisableCode("")
          setDisableOtp("")
          onComplete?.()
        },
      }
    )
  }

  if (showDisable) {
    return (
      <div className="space-y-5 rounded-lg border border-border p-5">
        <div className="space-y-3">
          <p className="text-sm font-medium">Masukkan kode dari aplikasi authenticator:</p>
          <div className="flex justify-center">
            <OTPInput value={disableCode} onChange={setDisableCode} length={6} />
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium">Masukkan OTP yang dikirim ke email:</p>
          <div className="flex justify-center">
            <OTPInput value={disableOtp} onChange={setDisableOtp} length={6} />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleCancelDisable} data-testid="button-cancel-disable-2fa">
            Batal
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleDisable2FA} disabled={disableCode.length !== 6 || disableOtp.length !== 6 || disable2FA.isPending} data-testid="button-confirm-disable-2fa">
            {disable2FA.isPending ? "Memproses..." : "Nonaktifkan 2FA"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
      <div className="flex items-center gap-3">
        <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">2FA Aktif</span>
      </div>
      <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20" disabled={requestDisableOtp.isPending} onClick={() => handleRequestDisableOtp()} data-testid="button-request-disable-2fa">
        <ShieldSlash className="mr-2 size-4" />
        Nonaktifkan
      </Button>
    </div>
  )
}
