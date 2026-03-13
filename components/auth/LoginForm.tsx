"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeSlash, SpinnerGap } from "@phosphor-icons/react"
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema"
import { useLogin } from "@/lib/hooks/use-auth"
import { ROUTES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// SEC-002 FIX: Use stable persistent UUID instead of userAgent (which changes each browser update)
// H-06 FIX: Key includes version suffix (v2) so future format changes can trigger
// automatic migration without reusing stale keys from old formats.
const DEVICE_ID_KEY = 'kahade_device_id_v2'

function getDeviceId(): string {
  if (typeof window === "undefined") return "web"
  const stored = localStorage.getItem(DEVICE_ID_KEY)
  if (stored) return stored
  const newId = crypto.randomUUID()
  localStorage.setItem(DEVICE_ID_KEY, newId)
  // Cleanup legacy key if it exists
  localStorage.removeItem('kahade_device_id')
  return newId
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()

  // M-5 FIX: getDeviceId() was called inline in useForm defaultValues, which runs
  // during render — including SSR. Although it has a typeof window guard, calling
  // localStorage synchronously in render is not safe for future SSR scenarios.
  // Moved to useState initializer which only runs client-side.
  const [deviceId] = useState(() => getDeviceId())

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      deviceId: deviceId,
      deviceInfo: typeof window !== "undefined" ? navigator.userAgent.slice(0, 512) : undefined,
    },
  })

  function onSubmit(values: LoginInput) {
    loginMutation.mutate({
      email: values.email,
      password: values.password,
      deviceId: values.deviceId,
      deviceInfo: values.deviceInfo,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {loginMutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {(loginMutation.error as Error)?.message || "Email atau password salah. Silakan coba lagi."}
            </AlertDescription>
          </Alert>
        )}

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
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link
                  href={ROUTES.FORGOT_PASSWORD}
                  className="text-sm font-medium text-primary hover:underline"
                  data-testid="link-forgot-password"
                >
                  Lupa Password?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
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
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
          data-testid="button-submit-login"
        >
          {loginMutation.isPending && <SpinnerGap className="size-4 animate-spin" />}
          Masuk
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href={ROUTES.REGISTER} className="text-primary hover:underline font-medium" data-testid="link-register">
            Daftar sekarang
          </Link>
        </p>
      </form>
    </Form>
  )
}
