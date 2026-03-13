"use client"

import { useForm } from "react-hook-form"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { SpinnerGap } from "@phosphor-icons/react"
import { verifyEmailSchema, type VerifyEmailInput } from "@/lib/validations/auth.schema"
import { useVerifyEmail, useResendVerification } from "@/lib/hooks/use-auth"
import { useCountdown } from "@/lib/hooks/use-countdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OTPInput } from "@/components/shared/OTPInput"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get("email") ?? ""
  const verifyMutation = useVerifyEmail()
  const resendMutation = useResendVerification()
  const countdown = useCountdown(60)

  const form = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: emailFromUrl,
      otp: "",
    },
  })

  function onSubmit(values: VerifyEmailInput) {
    verifyMutation.mutate({ email: values.email, otp: values.otp })
  }

  function handleResend() {
    const email = form.getValues("email")
    if (!email) {
      form.setError("email", { message: "Masukkan email terlebih dahulu" })
      return
    }
    // M-4 FIX: The button is already disabled when countdown.isRunning, so the
    // module-level resendCooldownUntil in useResendVerification acts as a server-side
    // guard while countdown is the UI timer. To prevent de-sync, we restart the
    // countdown inside onSuccess so both mechanisms stay in step.
    resendMutation.mutate({ email }, {
      onSuccess: () => countdown.restart(),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode OTP</FormLabel>
              <FormControl>
                <div className="flex justify-center">
                  <OTPInput value={field.value} onChange={field.onChange} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={verifyMutation.isPending}
          data-testid="button-submit-verify-email"
        >
          {verifyMutation.isPending && <SpinnerGap className="size-4 animate-spin" />}
          Verifikasi Email
        </Button>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resendMutation.isPending || countdown.isRunning}
            data-testid="button-resend-otp"
          >
            {resendMutation.isPending ? (
              <SpinnerGap className="size-4 animate-spin" />
            ) : countdown.isRunning ? (
              `Kirim ulang (${countdown.formatted})`
            ) : (
              "Kirim ulang kode"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
