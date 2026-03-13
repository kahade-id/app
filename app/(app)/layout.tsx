import { AppShell } from "@/components/app/layout/AppShell"

// #004 FIX: Removed `export const dynamic = "force-dynamic"`.
// This was forcing every single authenticated page to be SSR, preventing
// static optimization and ISR. Use force-dynamic per-route only when truly needed.

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
