"use client"

import * as React from "react"
import { Shield } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { OTPInput, CopyButton } from "@/components/shared"
import { useSetup2FA, useEnable2FA } from "@/lib/hooks/use-auth"
import { PasswordInput } from "@/shared/components/shared/PasswordInput"

interface TwoFASetupModalProps {
  onComplete?: () => void
}

export function TwoFASetupModal({ onComplete }: TwoFASetupModalProps) {
  const setup2FA = useSetup2FA()
  const enable2FA = useEnable2FA()

  const [qrCode, setQrCode] = React.useState("")
  const [backupCodes, setBackupCodes] = React.useState<string[]>([])
  const [totpCode, setTotpCode] = React.useState("")
  const [showSetup, setShowSetup] = React.useState(false)
  const [setupPassword, setSetupPassword] = React.useState("")

  const handleSetup2FA = () => {
    if (!setupPassword) return
    setup2FA.mutate({ password: setupPassword }, {
      onSuccess: ({ data: res }) => {
        if (res.data) {
          setQrCode(res.data.qrCode)
          setBackupCodes(res.data.backupCodes)
          setShowSetup(true)
          setSetupPassword("")
        }
      },
    })
  }

  const handleCancelSetup = () => {
    setShowSetup(false)
    setQrCode("")
    setBackupCodes([])
    setTotpCode("")
  }

  const handleEnable2FA = () => {
    enable2FA.mutate({ code: totpCode }, {
      onSuccess: () => {
        setShowSetup(false)
        setTotpCode("")
        onComplete?.()
      },
    })
  }

  if (showSetup && qrCode) {
    // H-11 FIX: Validate qrCode is a safe data URI (base64 PNG/SVG from server).
    // If the API is compromised or returns an unexpected URL, refuse to render it
    // as an <img src> to prevent loading arbitrary external resources.
    // Acceptable formats: data:image/png;base64,... or data:image/svg+xml;base64,...
    const isSafeQrCode = /^data:image\/(png|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(qrCode)

    return (
      <div className="space-y-5 rounded-lg border border-border p-5">
        <div className="flex justify-center">
          <div className="rounded-xl border border-border bg-white p-3">
            {isSafeQrCode ? (
              <img src={qrCode} alt="QR Code 2FA" className="size-48" />
            ) : (
              <div className="size-48 flex items-center justify-center bg-muted rounded text-sm text-destructive text-center p-4">
                QR Code tidak valid. Silakan coba lagi.
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">Scan QR code di atas dengan aplikasi authenticator Anda</p>
        {backupCodes.length > 0 && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">Kode Cadangan:</p>
              <CopyButton value={backupCodes.join("\n")} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code) => (
                <code key={code} className="rounded-md border border-border bg-muted px-2 py-1.5 text-center text-xs font-mono">{code}</code>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Simpan kode-kode ini di tempat yang aman. Setiap kode hanya bisa digunakan satu kali.</p>
          </div>
        )}
        <div className="space-y-3">
          <p className="text-sm font-medium">Masukkan kode dari aplikasi authenticator:</p>
          <div className="flex justify-center">
            <OTPInput value={totpCode} onChange={setTotpCode} length={6} />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleCancelSetup} data-testid="button-cancel-2fa-setup">
              Batal
            </Button>
            <Button className="flex-1" onClick={handleEnable2FA} disabled={totpCode.length !== 6 || enable2FA.isPending} data-testid="button-enable-2fa">
              {enable2FA.isPending ? "Memverifikasi..." : "Verifikasi & Aktifkan"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-3">
        <Shield className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">2FA belum diaktifkan</span>
      </div>
      <div className="space-y-2">
        <PasswordInput
          value={setupPassword}
          onChange={(e) => setSetupPassword(e.target.value)}
          placeholder="Masukkan password untuk verifikasi"
          autoComplete="current-password"
          data-testid="input-2fa-setup-password"
        />
        <Button className="w-full" onClick={handleSetup2FA} disabled={!setupPassword || setup2FA.isPending} data-testid="button-setup-2fa">
          {setup2FA.isPending ? "Memproses..." : "Aktifkan 2FA"}
        </Button>
      </div>
    </div>
  )
}
