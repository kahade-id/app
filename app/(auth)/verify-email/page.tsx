import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthCard } from "@/components/auth/AuthCard"
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm"
import { LoadingState } from "@/components/shared/LoadingState"

export const metadata: Metadata = {
  title: "Verifikasi Email",
  description: "Masukkan kode OTP yang telah dikirim ke email Anda untuk memverifikasi akun Kahade.",
}

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Verifikasi Email"
      description="Masukkan kode OTP yang telah dikirim ke email Anda"
    >
      <Suspense fallback={<LoadingState text="Memuat formulir..." />}>
        <VerifyEmailForm />
      </Suspense>
    </AuthCard>
  )
}
