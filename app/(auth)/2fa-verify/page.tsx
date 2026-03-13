import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthCard } from "@/components/auth/AuthCard"
import { TwoFAForm } from "@/components/auth/TwoFAForm"
import { LoadingState } from "@/components/shared/LoadingState"

export const metadata: Metadata = {
  title: "Verifikasi 2FA",
  description: "Masukkan kode autentikasi dua faktor untuk melanjutkan masuk ke akun Kahade.",
}

export default function TwoFAVerifyPage() {
  return (
    <AuthCard
      title="Verifikasi 2FA"
      description="Akun Anda dilindungi dengan autentikasi dua faktor"
    >
      <Suspense fallback={<LoadingState text="Memuat formulir..." />}>
        <TwoFAForm />
      </Suspense>
    </AuthCard>
  )
}
