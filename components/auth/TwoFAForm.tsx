"use client"

import Link from "next/link"
import * as React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SpinnerGap, ArrowLeft } from "@phosphor-icons/react"
import { twoFAVerifyLoginSchema, type TwoFAVerifyLoginInput } from "@/lib/validations/auth.schema"
import { useVerify2FALogin } from "@/lib/hooks/use-auth"
import { ROUTES } from "@/lib/constants"
import { safeSessionStorage } from "@/lib/safe-storage"
import { OTPInput } from "@/components/shared/OTPInput"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// H-06 FIX: Versioned key for deviceId (matches LoginForm.tsx)
const DEVICE_ID_KEY = 'kahade_device_id_v2'

function getDeviceId(): string {
  if (typeof window === "undefined") return "web"
  const stored = localStorage.getItem(DEVICE_ID_KEY)
  if (stored) return stored
  const newId = crypto.randomUUID()
  localStorage.setItem(DEVICE_ID_KEY, newId)
  localStorage.removeItem('kahade_device_id')
  return newId
}

export function TwoFAForm() {
  const [tempToken, setTempToken] = useState("")
  // M-6 FIX: Store tempToken in a ref so it's always available at submit time,
  // even if the user submits before the second useEffect (setValue) has fired.
  // The ref is updated synchronously in the same flow as setTempToken.
  const tempTokenRef = React.useRef("")
  const verifyMutation = useVerify2FALogin()

  // M-5 FIX (parity with LoginForm.tsx): getDeviceId() must NOT be called inline inside
  // useForm's defaultValues — that runs on every render, including SSR, and reads from
  // localStorage synchronously during rendering. Move to useState initializer which only
  // executes once on the client. LoginForm.tsx already had this fix applied; this brings
  // TwoFAForm.tsx into parity.
  const [deviceId] = useState(() => getDeviceId())

  useEffect(() => {
    // BUG-004 FIX: Read from sessionStorage where useLogin saved it
    // #16 FIX: Cek expiry — hapus token jika sudah kadaluarsa (> 15 menit)
    const exp = safeSessionStorage.getItem("kahade_2fa_temp_exp")
    if (exp && Date.now() > parseInt(exp, 10)) {
      safeSessionStorage.removeItem("kahade_2fa_temp")
      safeSessionStorage.removeItem("kahade_2fa_temp_exp")
      setTempToken("")
      tempTokenRef.current = ""
      return
    }
    const token = safeSessionStorage.getItem("kahade_2fa_temp") ?? ""
    setTempToken(token)
    tempTokenRef.current = token
  }, [])

  const form = useForm<TwoFAVerifyLoginInput>({
    resolver: zodResolver(twoFAVerifyLoginSchema),
    defaultValues: {
      tempToken: "",
      code: "",
      deviceId: deviceId,
      deviceInfo: typeof window !== "undefined" ? navigator.userAgent.slice(0, 512) : undefined,
    },
  })

  // Sync tempToken into form once loaded from sessionStorage
  useEffect(() => {
    if (tempToken) {
      form.setValue("tempToken", tempToken)
    }
  }, [tempToken, form])

  function onSubmit(values: TwoFAVerifyLoginInput) {
    // M-6 FIX: Use ref value as fallback in case setValue hasn't updated the form yet.
    const tokenToUse = values.tempToken || tempTokenRef.current
    verifyMutation.mutate({
      tempToken: tokenToUse,
      code: values.code,
      deviceId: values.deviceId,
      deviceInfo: values.deviceInfo,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* L-05 FIX: Show a clear message when tempToken is missing (user navigated
            directly to /2fa-verify without going through login first).
            Previously the button was just silently disabled with no explanation. */}
        {!tempToken && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive text-center space-y-2">
            <p>Sesi verifikasi 2FA tidak ditemukan atau sudah kadaluarsa.</p>
            <Link href={ROUTES.LOGIN} className="font-medium underline hover:no-underline">
              Silakan login ulang
            </Link>
          </div>
        )}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode 2FA</FormLabel>
              <FormControl>
                <div className="flex justify-center">
                  {/* L-06 FIX: Explicit length={6} so behavior is not dependent
                      on the OTPInput component's default value changing in future */}
                  <OTPInput value={field.value} onChange={field.onChange} length={6} />
                </div>
              </FormControl>
              <FormDescription className="text-center">
                Masukkan kode dari aplikasi authenticator atau backup code Anda.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={verifyMutation.isPending || !tempToken}
          data-testid="button-submit-2fa"
        >
          {verifyMutation.isPending && <SpinnerGap className="size-4 animate-spin" />}
          Verifikasi
        </Button>

        <div className="text-center">
          <Link
            href={ROUTES.LOGIN}
            className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
            data-testid="link-back-to-login"
          >
            <ArrowLeft className="size-3" />
            Kembali ke Login
          </Link>
        </div>
      </form>
    </Form>
  )
}
