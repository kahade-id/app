// #043 FIX: Added server-side metadata for correct SSR page title.
// Previously only usePageTitle() was used — a client-side hook that updates
// document.title after hydration, leaving the title blank on initial SSR render.
//
// NSR-001 FIX: Removed "use client" and usePageTitle().
// This page is a Server Component — its only job is to render <AuthCard> + <LoginForm>.
// LoginForm already carries its own "use client" boundary.
// "use client" + export const metadata is invalid: metadata is silently ignored in
// Client Components (Next.js App Router only reads metadata from Server Components).
// Removing "use client" makes the metadata export actually work.
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Masuk ke Kahade",
  description: "Masuk ke akun Kahade Anda untuk melanjutkan transaksi.",
}

import { AuthCard } from "@/components/auth/AuthCard"
import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <AuthCard
      title="Masuk ke Kahade"
      description="Masukkan email dan password untuk melanjutkan"
    >
      <LoginForm />
    </AuthCard>
  )
}
