// #25 FIX: Ekstrak NAV_ITEMS ke file terpisah sebagai single source of truth.
// Sebelumnya AppTopbar dan AppSidebar masing-masing mendefinisikan daftar navigasi sendiri —
// dua source of truth yang bisa out of sync saat menambah route baru.

// M-10 FIX: Added React import — NavItem.icon uses React.ComponentType<> which requires
// React to be in scope. Without this import TypeScript may error under isolatedModules.
import type React from "react"

import {
  SquaresFour,
  ArrowsLeftRight,
  ShieldCheck,
  Wallet,
  Bell,
  Chat,
  Scales,
  Star,
  Medal,
  Ticket,
  Users,
  Crown,
  Monitor,
  GearSix,
  Question,
} from "@phosphor-icons/react/dist/ssr"
import { ROUTES } from "@/lib/constants"

export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",   href: ROUTES.DASHBOARD,     icon: SquaresFour },
  { label: "Transaksi",   href: ROUTES.TRANSACTIONS,  icon: ArrowsLeftRight },
  { label: "Escrow",      href: ROUTES.ESCROW,        icon: ShieldCheck },
  { label: "Dompet",      href: ROUTES.WALLET,        icon: Wallet },
  { label: "Notifikasi",  href: ROUTES.NOTIFICATIONS, icon: Bell },
  { label: "Chat",        href: ROUTES.CHAT_LIST,     icon: Chat },
  { label: "Dispute",     href: ROUTES.DISPUTES,      icon: Scales },
  { label: "Rating",      href: ROUTES.RATINGS,       icon: Star },
  { label: "Badges",      href: ROUTES.BADGES,        icon: Medal },
  { label: "Voucher",     href: ROUTES.VOUCHERS,      icon: Ticket },
  { label: "Referral",    href: ROUTES.REFERRAL,      icon: Users },
  { label: "Langganan",   href: ROUTES.SUBSCRIPTION,  icon: Crown },
  { label: "Sesi",        href: ROUTES.SESSIONS,      icon: Monitor },
  { label: "Pengaturan",  href: ROUTES.SETTINGS,      icon: GearSix },
  { label: "Bantuan",     href: ROUTES.HELP,          icon: Question },
]
