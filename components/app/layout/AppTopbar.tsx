"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { List, Shield } from "@phosphor-icons/react"
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

export function AppTopbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu navigasi"
          data-testid="button-mobile-menu-open"
        >
          <List className="size-5" />
        </Button>

        <div className="flex items-center gap-2 lg:hidden">
          <Shield className="size-6 text-primary" />
          <span className="font-bold text-base">Kahade</span>
        </div>

        <div className="hidden lg:block" />

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <NotificationBell />
          <UserDropdown />
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-4">
            <SheetTitle asChild>
              <div>
                <Link
                  href={ROUTES.DASHBOARD}
                  className="flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Shield className="size-8 text-primary" />
                  <span className="font-bold text-lg">Kahade</span>
                </Link>
              </div>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 py-4">
            <nav aria-label="Menu navigasi" className="flex flex-col gap-1 px-3">
              {NAV_ITEMS.map((item) => {
                const isActive = item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/")
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
        </SheetContent>
      </Sheet>
    </>
  )
}
