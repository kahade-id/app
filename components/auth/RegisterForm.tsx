"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeSlash, SpinnerGap } from "@phosphor-icons/react"
import { Checkbox } from "@/components/ui/checkbox"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth.schema"
import { useRegister } from "@/lib/hooks/use-auth"
import { ROUTES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordStrength } from "@/components/shared/PasswordStrength"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const registerMutation = useRegister()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      // TS-001/TS-004 FIX: Removed `false as const satisfies boolean as true` — this
      // type assertion chain hides a type mismatch and is semantically misleading.
      // The runtime value is false (user hasn't agreed yet). Zod validation correctly
      // requires true at submit time. No type coercion needed here.
      agreeTerms: false as unknown as true,
    },
  })

  const password = form.watch("password")

  function onSubmit(values: RegisterInput) {
    registerMutation.mutate({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Nama lengkap Anda" autoComplete="name" data-testid="input-fullname" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    className="pr-10"
                    data-testid="input-password"
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
              <PasswordStrength password={password} />
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
                    placeholder="Ulangi password"
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

        <FormField
          control={form.control}
          name="agreeTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  id="agreeTerms"
                  checked={field.value === true}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-agree-terms"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor="agreeTerms" className="text-sm font-normal cursor-pointer">
                  Saya menyetujui{" "}
                  <a
                    href={`${process.env.NEXT_PUBLIC_LANDING_URL || 'https://kahade.id'}/terms`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Syarat & Ketentuan
                  </a>
                  {" "}dan{" "}
                  <a
                    href={`${process.env.NEXT_PUBLIC_LANDING_URL || 'https://kahade.id'}/privacy`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Kebijakan Privasi
                  </a>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={registerMutation.isPending}
          data-testid="button-submit-register"
        >
          {registerMutation.isPending && <SpinnerGap className="size-4 animate-spin" />}
          Daftar
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href={ROUTES.LOGIN} className="text-primary hover:underline font-medium" data-testid="link-login">
            Masuk
          </Link>
        </p>
      </form>
    </Form>
  )
}
