"use client"

import { useRouter } from "next/navigation"
import { User, GearSix, Shield, CreditCard, SignOut, Crown } from "@phosphor-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/stores/auth.store"
import { ROUTES, KYC_STATUS_LABELS, MEMBERSHIP_RANK_LABELS } from "@/lib/constants"
import { StatusBadge } from "@/components/shared/StatusBadge"

export function UserDropdown() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  if (!user) return null

  const initials = (user.fullName ?? "")
  .split(" ")
  .filter(Boolean)
  .map((n) => n[0] ?? "")
  .join("")
  .toUpperCase()
  .slice(0, 2) || "?"

  const handleLogout = () => {
    logout()
    router.push(ROUTES.LOGIN)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Avatar className="size-8">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
            <AvatarFallback className="text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold leading-none">{user.fullName}</p>
              {user.isKahadePlus && (
                <Crown className="size-3.5 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status={user.kycStatus} label={KYC_STATUS_LABELS[user.kycStatus]} />
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {MEMBERSHIP_RANK_LABELS[user.membershipRank] ?? user.membershipRank}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push(ROUTES.PROFILE)}>
            <User className="size-4" />
            Profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(ROUTES.PROFILE_SECURITY)}>
            <Shield className="size-4" />
            Keamanan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(ROUTES.PROFILE_BANK)}>
            <CreditCard className="size-4" />
            Rekening Bank
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(ROUTES.SETTINGS)}>
            <GearSix className="size-4" />
            Pengaturan
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <SignOut className="size-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
            }
