// #043 FIX: Added server-side metadata for correct SSR page title.
//
// NSR-001 FIX: Removed "use client" and usePageTitle().
// This page is a Server Component — its only job is to render <AuthCard> + <RegisterForm>.
// RegisterForm already carries its own "use client" boundary.
// "use client" + export const metadata is invalid: metadata is silently ignored in
// Client Components (Next.js App Router only reads metadata from Server Components).
// Removing "use client" makes the metadata export actually work.
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Daftar Akun Kahade",
  description: "Buat akun Kahade untuk mulai bertransaksi dengan aman menggunakan escrow P2P.",
}

import { AuthCard } from "@/components/auth/AuthCard"
import { RegisterForm } from "@/components/auth/RegisterForm"

export default function RegisterPage() {
  return (
    <AuthCard
      title="Daftar Akun"
      description="Buat akun Kahade untuk mulai bertransaksi dengan aman"
    >
      <RegisterForm />
    </AuthCard>
  )
}
