"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield } from "@phosphor-icons/react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"
import { useAuthStore } from "@/lib/stores/auth.store"
import { ScrollArea } from "@/components/ui/scroll-area"
// #25 FIX: Import NAV_ITEMS dari shared nav-config — single source of truth
import { NAV_ITEMS } from "@/lib/nav-config"

export function AppSidebar() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r bg-background h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 h-16 border-b shrink-0">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2 text-primary">
          <Shield className="size-8" />
          <span className="font-bold text-lg">Kahade</span>
        </Link>
      </div>

      {/* M-9 FIX: Removed overflow-y-auto — Radix ScrollArea manages its own
          internal scroll container. Adding overflow-y-auto on the wrapper can
          conflict with the Radix viewport element and produce double scrollbars. */}
      <ScrollArea className="flex-1 py-4">
        <nav aria-label="Navigasi samping" className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {user && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={`Avatar ${user.fullName}`}
                width={36}
                height={36}
                className="size-9 rounded-full object-cover"
              />
            ) : (
              <div className="size-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                {/* #068 FIX: filter(Boolean) guards against empty tokens from multiple spaces;
                     optional chaining on n[0] prevents crash on edge-case fullNames */}
                {(user.fullName ?? "")
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0] ?? "")
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.username ? `@${user.username}` : user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
