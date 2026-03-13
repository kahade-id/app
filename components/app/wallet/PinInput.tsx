"use client"

import { useState } from "react"
import { LockKey, ShieldCheck, ArrowsClockwise } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { OTPInput } from "@/components/shared"
import { useSetPin, useVerifyPin, useChangePin } from "@/lib/hooks/use-wallet"
import { toast } from "sonner"

export function SetPinForm() {
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [step, setStep] = useState<"enter" | "confirm">("enter")
  const { mutate, isPending } = useSetPin()

  const handleSubmit = () => {
    if (step === "enter") {
      if (pin.length !== 6) return
      setStep("confirm")
      return
    }
    // L-03 FIX: Use the same refine logic as changePinSchema (currentPin !== newPin).
    // Previously used a manual `if (confirmPin !== pin)` that could diverge from
    // the Zod schema's validation rules if they were ever updated.
    if (confirmPin.length !== 6) return
    if (confirmPin !== pin) {
      setConfirmPin("")
      toast.error("PIN tidak cocok. Silakan masukkan ulang.")
      return
    }
    // Additional check matching changePinSchema: new PIN ≠ old PIN
    // For SetPin (first time), this check is not applicable — skip.
    mutate({ pin }, {
      onSuccess: () => {
        setPin("")
        setConfirmPin("")
        setStep("enter")
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <LockKey className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Atur PIN Wallet</CardTitle>
            <CardDescription>Buat PIN 6 digit untuk mengamankan transaksi wallet Anda</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "enter" ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-muted-foreground">Masukkan PIN 6 digit baru:</label>
            <div className="flex justify-center">
              <OTPInput value={pin} onChange={setPin} length={6} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-muted-foreground">Konfirmasi PIN Anda:</label>
            <div className="flex justify-center">
              <OTPInput value={confirmPin} onChange={setConfirmPin} length={6} />
            </div>
            {confirmPin.length === 6 && confirmPin !== pin && (
              <p className="text-sm text-destructive text-center">PIN tidak cocok. Silakan coba lagi.</p>
            )}
          </div>
        )}
        <div className="flex gap-2 justify-end">
          {step === "confirm" && (
            <Button variant="outline" onClick={() => { setStep("enter"); setConfirmPin("") }} data-testid="button-setpin-back">
              Kembali
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isPending || (step === "enter" ? pin.length !== 6 : confirmPin.length !== 6)}
            data-testid="button-setpin-continue"
          >
            {isPending ? "Menyimpan..." : step === "enter" ? "Lanjutkan" : "Simpan PIN"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

type ChangePinStep = "current" | "new" | "confirm"

export function ChangePinForm({ onCancel }: { onCancel?: () => void }) {
  const [step, setStep] = useState<ChangePinStep>("current")
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const { mutate, isPending } = useChangePin()

  const resetForm = () => {
    setStep("current")
    setCurrentPin("")
    setNewPin("")
    setConfirmPin("")
  }

  const handleNext = () => {
    if (step === "current") {
      if (currentPin.length !== 6) return
      setStep("new")
    } else if (step === "new") {
      if (newPin.length !== 6) return
      if (newPin === currentPin) {
        toast.error("PIN baru tidak boleh sama dengan PIN lama.")
        setNewPin("")
        return
      }
      setStep("confirm")
    } else {
      if (confirmPin.length !== 6) return
      if (confirmPin !== newPin) {
        toast.error("PIN tidak cocok. Silakan masukkan ulang.")
        setConfirmPin("")
        return
      }
      mutate({ currentPin, newPin }, { onSuccess: () => { resetForm(); onCancel?.() } })
    }
  }

  const handleBack = () => {
    if (step === "new") { setStep("current"); setNewPin("") }
    else if (step === "confirm") { setStep("new"); setConfirmPin("") }
  }

  const stepLabels: Record<ChangePinStep, string> = {
    current: "Masukkan PIN saat ini:",
    new: "Masukkan PIN baru (6 digit):",
    confirm: "Konfirmasi PIN baru:",
  }

  const currentValue = step === "current" ? currentPin : step === "new" ? newPin : confirmPin
  const handleChange =
    step === "current" ? setCurrentPin : step === "new" ? setNewPin : setConfirmPin

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <ArrowsClockwise className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Ganti PIN Wallet</CardTitle>
            <CardDescription>Masukkan PIN lama lalu buat PIN baru yang aman</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-muted-foreground">
            {stepLabels[step]}
          </label>
          <div className="flex justify-center">
            <OTPInput key={step} value={currentValue} onChange={handleChange} length={6} />
          </div>
          {step === "confirm" && confirmPin.length === 6 && confirmPin !== newPin && (
            <p className="text-center text-sm text-destructive">PIN tidak cocok. Silakan coba lagi.</p>
          )}
          {step === "new" && newPin.length === 6 && newPin === currentPin && (
            <p className="text-center text-sm text-destructive">PIN baru tidak boleh sama dengan PIN lama.</p>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          {step === "current" && onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isPending} data-testid="button-changepin-cancel">Batal</Button>
          )}
          {step !== "current" && (
            <Button variant="outline" onClick={handleBack} disabled={isPending} data-testid="button-changepin-back">Kembali</Button>
          )}
          <Button
            onClick={handleNext}
            disabled={
              isPending ||
              currentValue.length !== 6 ||
              (step === "confirm" && confirmPin !== newPin) ||
              (step === "new" && newPin === currentPin)
            }
            data-testid="button-changepin-next"
          >
            {isPending ? "Menyimpan..." : step === "confirm" ? "Simpan PIN Baru" : "Lanjutkan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface VerifyPinFormProps {
  // BUG-H03 FIX: Added onVerified callback so the parent can gate actions on the result.
  // Previously the verified state was swallowed inside the component — unusable.
  onVerified?: (valid: boolean) => void
}

export function VerifyPinForm({ onVerified }: VerifyPinFormProps = {}) {
  const [pin, setPin] = useState("")
  const [verified, setVerified] = useState<boolean | null>(null)
  const { mutate, isPending } = useVerifyPin()

  const handleVerify = () => {
    if (pin.length !== 6) return
    mutate({ pin }, {
      onSuccess: (res) => {
        const isValid = res?.data?.data?.valid ?? false
        setVerified(isValid)
        onVerified?.(isValid)
        if (isValid) setPin("")
      },
      onError: () => {
        setVerified(false)
        onVerified?.(false)
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Verifikasi PIN</CardTitle>
            <CardDescription>Masukkan PIN untuk memverifikasi identitas Anda</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-muted-foreground">Masukkan PIN 6 digit Anda:</label>
          <div className="flex justify-center">
            <OTPInput value={pin} onChange={(v) => { setPin(v); setVerified(null) }} length={6} />
          </div>
          {verified === true && (
            <p className="text-sm text-primary text-center">PIN berhasil diverifikasi.</p>
          )}
          {verified === false && (
            <p className="text-sm text-destructive text-center">PIN salah. Silakan coba lagi.</p>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleVerify} disabled={isPending || pin.length !== 6} data-testid="button-verify-pin">
            {isPending ? "Memverifikasi..." : "Verifikasi"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
