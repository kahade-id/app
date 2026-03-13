import type { Metadata } from "next"
import { AuthCard } from "@/components/auth/AuthCard"
import { SetUsernameForm } from "@/components/auth/SetUsernameForm"

export const metadata: Metadata = {
  title: "Atur Username",
  description: "Pilih username unik untuk akun Kahade Anda.",
}

export default function SetUsernamePage() {
  return (
    <AuthCard
      title="Atur Username"
      description="Pilih username unik untuk akun Anda"
    >
      <SetUsernameForm />
    </AuthCard>
  )
}
