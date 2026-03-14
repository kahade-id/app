"use client"

import { useEffect } from "react"
import { AppSidebar } from "./AppSidebar"
import { AppTopbar } from "./AppTopbar"
import { AppBottomNav } from "./AppBottomNav"
import { KycBanner } from "../dashboard/KycBanner"
import { useAuthStore } from "@/lib/stores/auth.store"
import { RefreshableLayout } from "@/components/pull-to-refresh"
import { useInterceptKeyboardRefresh } from "@/lib/hooks/use-intercept-keyboard-refresh"

export function AppShell({ children }: { children: React.ReactNode }) {
  const refreshActivity = useAuthStore((s) => s.refreshActivity)

  // Phase 2: Intercept F5/Ctrl+R -> soft refresh via TanStack Query
  useInterceptKeyboardRefresh()

  useEffect(() => {
    // UX-005 FIX: Attach activity listeners supaya session timeout
    // dihitung dari last activity, bukan login time.
    const handleActivity = () => refreshActivity()
    window.addEventListener("click", handleActivity, { passive: true })
    window.addEventListener("keydown", handleActivity, { passive: true })
    return () => {
      window.removeEventListener("click", handleActivity)
      window.removeEventListener("keydown", handleActivity)
    }
  }, [refreshActivity])

  return (
    <div className="flex h-dvh overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar />
        {/* RefreshableLayout: pull-to-refresh mobile + overscroll-contain */}
        <RefreshableLayout className="flex-1 overflow-y-auto overscroll-y-contain">
          <main
            id="main-content"
            className="p-4 lg:p-6 pb-28 lg:pb-6 space-y-6"
          >
            <KycBanner />
            {children}
          </main>
        </RefreshableLayout>
      </div>
      <AppBottomNav />
    </div>
  )
}
