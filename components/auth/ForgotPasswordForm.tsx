"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SpinnerGap, ArrowLeft, CheckCircle } from "@phosphor-icons/react"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth.schema"
import { useForgotPassword } from "@/lib/hooks/use-auth"
import { ROUTES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const forgotMutation = useForgotPassword()

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  function onSubmit(values: ForgotPasswordInput) {
    forgotMutation.mutate(values, {
      onSuccess: () => {
        setSubmittedEmail(values.email)
        setSubmitted(true)
      },
    })
  }

  if (submitted) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle className="mx-auto size-12 text-emerald-500" weight="fill" />
        <p className="text-sm text-muted-foreground">
          Jika email terdaftar, kami akan mengirimkan kode OTP untuk reset password.
          Silakan cek inbox Anda.
        </p>
        <Button className="w-full" asChild>
          <Link href={`${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(submittedEmail)}`}>
            Lanjut Reset Password
          </Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href={ROUTES.LOGIN}>
            <ArrowLeft className="size-4" />
            Kembali ke Login
          </Link>
        </Button>
      </div>
    )
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
                  data-testid="input-email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={forgotMutation.isPending}
          data-testid="button-submit-forgot-password"
        >
          {forgotMutation.isPending && <SpinnerGap className="size-4 animate-spin" />}
          Kirim Kode OTP
        </Button>

        <div className="text-center">
          <Link
            href={ROUTES.LOGIN}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
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
