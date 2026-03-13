import type { Metadata } from "next"
import { AuthCard } from "@/components/auth/AuthCard"
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"

export const metadata: Metadata = {
  title: "Lupa Password",
  description: "Masukkan email Anda untuk mendapatkan kode OTP reset password akun Kahade.",
}

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Lupa Password"
      description="Masukkan email Anda untuk mendapatkan link reset password"
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
