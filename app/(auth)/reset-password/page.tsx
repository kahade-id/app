import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthCard } from "@/components/auth/AuthCard"
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"
import { LoadingState } from "@/components/shared/LoadingState"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Masukkan kode OTP dan password baru untuk mereset password akun Kahade Anda.",
}

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Reset Password"
      description="Masukkan kode OTP dan password baru Anda"
    >
      <Suspense fallback={<LoadingState text="Memuat formulir..." />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  )
}
