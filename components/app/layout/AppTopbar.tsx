"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { List, ArrowLeft } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationBell } from "./NotificationBell"
import { UserDropdown } from "./UserDropdown"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"
// #25 FIX: Gunakan NAV_ITEMS dari shared nav-config — tidak lagi hardcode MOBILE_NAV_ITEMS
// yang bisa out of sync dengan AppSidebar
import { NAV_ITEMS } from "@/lib/nav-config"

// ── Main nav pages: hamburger + logo + bell layout ───────────
const MAIN_NAV_ROUTES = [
  ROUTES.DASHBOARD,    // "/beranda"
  ROUTES.TRANSACTIONS, // "/transaksi"
  ROUTES.WALLET,       // "/wallet"
  ROUTES.PROFILE,      // "/profil"
]

// ── Page title map: route prefix → label for sub/detail pages ─
// Order matters — more specific prefixes should come first.
const PAGE_TITLE_MAP: Array<{ prefix: string; exact?: boolean; label: string }> = [
  // Dashboard baru
  { prefix: ROUTES.DASHBOARD,        exact: true, label: "Dashboard" },

  // Auth (shouldn't appear in AppShell, but safe fallback)
  { prefix: ROUTES.LOGIN,           exact: true, label: "Masuk" },
  { prefix: ROUTES.REGISTER,        exact: true, label: "Daftar" },

  // Transaksi sub-routes (before the parent)
  { prefix: ROUTES.TRANSACTION_NEW,              label: "Buat Transaksi" },
  { prefix: ROUTES.TRANSACTIONS,    exact: true, label: "Transaksi" },
  { prefix: "/transaksi/",                       label: "Detail Transaksi" },

  // Wallet sub-routes
  { prefix: ROUTES.WALLET_TOPUP,                 label: "Top Up" },
  { prefix: ROUTES.WALLET_WITHDRAW,              label: "Tarik Dana" },
  { prefix: ROUTES.WALLET_HISTORY,               label: "Riwayat Dompet" },
  { prefix: ROUTES.WALLET,          exact: true, label: "Dompet" },

  // Profile sub-routes
  { prefix: ROUTES.PROFILE_SECURITY,             label: "Keamanan" },
  { prefix: ROUTES.PROFILE_KYC,                  label: "Verifikasi KYC" },
  { prefix: ROUTES.PROFILE_BANK,                 label: "Rekening Bank" },
  { prefix: ROUTES.PROFILE_DEVICES,              label: "Perangkat" },
  { prefix: ROUTES.PROFILE_ACTIVITY,             label: "Aktivitas Akun" },
  { prefix: ROUTES.PROFILE,         exact: true, label: "Profil" },

  // Dispute
  { prefix: "/dispute/buat/",                    label: "Ajukan Dispute" },
  { prefix: ROUTES.DISPUTES,        exact: true, label: "Dispute" },
  { prefix: "/dispute/",                         label: "Detail Dispute" },

  // Chat
  { prefix: ROUTES.CHAT_LIST,       exact: true, label: "Chat" },
  { prefix: "/chat/",                            label: "Chat" },

  // Notifications
  { prefix: ROUTES.NOTIFICATIONS,   exact: true, label: "Notifikasi" },

  // Standalone pages
  { prefix: ROUTES.ESCROW,          exact: true, label: "Escrow" },
  { prefix: ROUTES.BADGES,          exact: true, label: "Badges" },
  { prefix: ROUTES.VOUCHERS,        exact: true, label: "Voucher" },
  { prefix: ROUTES.REFERRAL,        exact: true, label: "Referral" },
  { prefix: ROUTES.RATINGS,         exact: true, label: "Rating" },
  { prefix: ROUTES.SUBSCRIPTION,    exact: true, label: "Langganan" },
  { prefix: ROUTES.SESSIONS,        exact: true, label: "Sesi Aktif" },
  { prefix: ROUTES.SETTINGS,        exact: true, label: "Pengaturan" },
  { prefix: ROUTES.HELP,            exact: true, label: "Bantuan" },

  // User profile
  { prefix: "/user/",                            label: "Profil Pengguna" },
]

function useTopbarMode(pathname: string): "main" | "sub" {
  // Phase 2 FIX: gunakan perbandingan langsung, bukan hardcode "/"
  const isMain = MAIN_NAV_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  )
  return isMain ? "main" : "sub"
}

function usePageTitle(pathname: string): string {
  for (const { prefix, exact, label } of PAGE_TITLE_MAP) {
    if (exact ? pathname === prefix : pathname.startsWith(prefix)) {
      return label
    }
  }
  // Fallback: capitalise the last path segment
  const segment = pathname.split("/").filter(Boolean).pop() ?? ""
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

export function AppTopbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const mode = useTopbarMode(pathname)
  const pageTitle = usePageTitle(pathname)

  return (
    <>
      {/* ── Mobile header (hidden on desktop) ─────────────────── */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center border-b border-gray-100 bg-white px-2 lg:hidden"
        aria-label="Header aplikasi"
      >
        {mode === "main" ? (
          /* ── Main nav pages: hamburger | logo | bell ──────── */
          <>
            {/* Left: Hamburger */}
            <div className="w-10">
              <Button
                variant="ghost"
                size="icon"
                className="size-10 text-gray-700"
                onClick={() => setMobileOpen(true)}
                aria-label="Buka menu navigasi"
                data-testid="button-mobile-menu-open"
              >
                <List className="size-5" weight="bold" />
              </Button>
            </div>

            {/* Center: Logo */}
            <div className="flex-1 flex justify-center">
              <Link href={ROUTES.DASHBOARD} aria-label="Kahade — Beranda">
                <Image
                  src="/favicon.svg"
                  alt="Kahade"
                  width={28}
                  height={28}
                  priority
                  className="select-none"
                />
              </Link>
            </div>

            {/* Right: Notification bell */}
            <div className="w-10 flex justify-end">
              <NotificationBell />
            </div>
          </>
        ) : (
          /* ── Sub / detail pages: back | title ──────────────── */
          <>
            {/* Left: Back arrow */}
            <div className="w-10">
              <Button
                variant="ghost"
                size="icon"
                className="size-10 text-gray-700"
                onClick={() => router.back()}
                aria-label="Kembali"
                data-testid="button-back"
              >
                <ArrowLeft className="size-5" weight="bold" />
              </Button>
            </div>

            {/* Center: Page title */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-sm font-semibold text-gray-900 tracking-tight">
                {pageTitle}
              </h1>
            </div>

            {/* Right: empty spacer for perfect centering */}
            <div className="w-10" aria-hidden="true" />
          </>
        )}
      </header>

      {/* ── Desktop header (hidden on mobile) ─────────────────── */}
      <header className="sticky top-0 z-40 hidden lg:flex h-16 items-center gap-4 border-b border-gray-100 bg-white px-6">
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <NotificationBell />
          <UserDropdown />
        </div>
      </header>

      {/* ── Mobile drawer (hamburger sheet) ───────────────────── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-white">
          <SheetHeader className="border-b border-gray-100 px-5 py-4">
            <SheetTitle asChild>
              <div>
                <Link
                  href={ROUTES.DASHBOARD}
                  className="flex items-center gap-2.5"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Kahade — Beranda"
                >
                  <Image
                    src="/favicon.svg"
                    alt="Kahade"
                    width={28}
                    height={28}
                    className="select-none"
                  />
                  <span className="font-bold text-base text-gray-900 tracking-tight">
                    Kahade
                  </span>
                </Link>
              </div>
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 py-3">
            <nav aria-label="Menu navigasi" className="flex flex-col gap-0.5 px-3">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon
                      className="size-4 shrink-0"
                      // @ts-ignore — weight prop exists on Phosphor icons
                      weight={isActive ? "fill" : "regular"}
                    />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
