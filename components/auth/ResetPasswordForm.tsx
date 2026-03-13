"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeSlash, SpinnerGap, ArrowLeft } from "@phosphor-icons/react"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth.schema"
import { useResetPassword } from "@/lib/hooks/use-auth"
import { ROUTES } from "@/lib/constants"
import { PasswordStrength } from "@/components/shared/PasswordStrength"
import { OTPInput } from "@/components/shared/OTPInput"
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

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const searchParams = useSearchParams()
  const resetMutation = useResetPassword()

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const newPassword = form.watch("newPassword")

  function onSubmit(values: ResetPasswordInput) {
    resetMutation.mutate({
      email: values.email,
      otp: values.otp,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
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

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password Baru</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    className="pr-10"
                    data-testid="input-new-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 rounded-l-none hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </FormControl>
              <PasswordStrength password={newPassword} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konfirmasi Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Ulangi password baru"
                    autoComplete="new-password"
                    className="pr-10"
                    data-testid="input-confirm-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 rounded-l-none hover:bg-transparent"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirm ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={resetMutation.isPending}
          data-testid="button-submit-reset-password"
        >
          {resetMutation.isPending && <SpinnerGap className="size-4 animate-spin" />}
          Reset Password
        </Button>

        <div className="text-center">
          <Link
            href={ROUTES.LOGIN}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="size-3" />
            Kembali ke Login
          </Link>
        </div>
      </form>
    </Form>
  )
}
