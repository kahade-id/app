"use client"

import { useEffect } from "react"
import { AppSidebar } from "./AppSidebar"
import { AppTopbar } from "./AppTopbar"
import { AppBottomNav } from "./AppBottomNav"
import { KycBanner } from "../dashboard/KycBanner"
import { useAuthStore } from "@/lib/stores/auth.store"

export function AppShell({ children }: { children: React.ReactNode }) {
  const refreshActivity = useAuthStore((s) => s.refreshActivity)

  useEffect(() => {
    // UX-005 FIX: refreshActivity() was defined in auth.store but never called anywhere,
    // so session timeout was always counted from login time, not last activity.
    // Attach to click and keydown events at the AppShell level to update last-active timestamp.
    const handleActivity = () => refreshActivity()
    window.addEventListener("click", handleActivity, { passive: true })
    window.addEventListener("keydown", handleActivity, { passive: true })
    return () => {
      window.removeEventListener("click", handleActivity)
      window.removeEventListener("keydown", handleActivity)
    }
  }, [refreshActivity])

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar />
        {/* M-8 FIX: Removed redundant role="main" — <main> already has the implicit
            ARIA landmark role "main". Adding it explicitly is redundant and can confuse
            some screen readers by doubling the landmark announcement. */}
        <main id="main-content" className="flex-1 p-4 lg:p-6 pb-28 lg:pb-6 space-y-6">
          <KycBanner />
          {children}
        </main>
      </div>
      <AppBottomNav />
    </div>
  )
}
