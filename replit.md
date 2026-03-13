# Kahade Dashboard App

## Project Overview

Kahade is an authenticated P2P escrow fintech platform for the Indonesian market. This is the full-stack dashboard web application.

## Technology Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v3 + Radix UI components
- **State Management**: Zustand v5 (auth), TanStack Query v5 (server state)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Phosphor Icons
- **HTTP Client**: Axios
- **Notifications**: Sonner

## Architecture

```
app/                    # Next.js App Router pages
  (auth)/               # Auth group: login, register, forgot-password, etc.
  (app)/                # Authenticated app group (wrapped by AppShell)
    page.tsx            # Dashboard (root "/" route)
    transaksi/          # Transaction list
    transaksi/[id]/     # Transaction detail
    escrow/             # Escrow management
    wallet/             # Wallet + top-up + withdraw
    notifikasi/         # Notifications
    chat/               # Chat (list + room)
    dispute/            # Dispute list + detail
    ratings/            # User ratings
    badges/             # Achievement badges
    voucher/            # Voucher codes
    referral/           # Referral program
    langganan/          # Subscription (Kahade+)
    sesi/               # Active sessions
    profil/             # User profile + KYC + security + bank accounts
    pengaturan/         # App settings
    bantuan/            # Help/FAQ
    user/[username]/    # Public user profile

components/
  app/                  # App-specific components (by feature)
    layout/             # AppShell, AppSidebar, AppTopbar, AppBottomNav
    dashboard/          # Dashboard widgets and KYC banner
    transaction/        # Transaction components
    wallet/             # Wallet components
    dispute/            # Dispute components
    ...
  providers/            # React context providers

lib/
  hooks/                # Custom React hooks (use-auth, use-transactions, etc.)
  services/             # API service layer (axios-based)
  stores/               # Zustand stores (auth.store)
  validations/          # Zod schemas
  constants.ts          # App-wide constants and routes
  nav-config.ts         # Navigation items (single source of truth)
  date.ts               # Date formatting utilities

shared/
  components/
    ui/                 # Shadcn/Radix UI components
    shared/             # Shared business components (DataTable, StatusBadge, etc.)
  lib/
    utils.ts            # cn() helper + sanitizeUrl()
    currency.ts         # IDR formatting utilities
  hooks/
    use-mobile.ts       # Responsive hook
  styles/
    index.css           # Global CSS + Tailwind base
  tailwind.preset.ts    # Tailwind configuration preset

types/                  # TypeScript type definitions
  auth.ts, transaction.ts, wallet.ts, dispute.ts, etc.

middleware.ts           # Next.js middleware (JWT auth guard, route protection)
```

## Development

The app runs on port 5000:
```bash
npm run dev       # next dev -p 5000 -H 0.0.0.0
npm run build     # next build
npm run start     # next start -p 5000 -H 0.0.0.0
npm run typecheck # tsc --noEmit
```

## Key Configuration

- **next.config.ts**: CSP headers, image optimization, /dashboard redirect, security headers
- **tsconfig.json**: Strict mode, path aliases (`@/*` → `./`, UI components via `shared/components/`)
- **tailwind.config.ts**: Custom design tokens, dark mode, custom animations
- **middleware.ts**: Route protection via JWT cookie (access_token), redirects unauthenticated users to /login

## Environment Variables

See `.env.example` for required environment variables:
- `NEXT_PUBLIC_API_URL` — Backend API base URL
- `NEXT_PUBLIC_APP_URL` — App URL (for metadata/OG)
- `NEXT_PUBLIC_LANDING_URL` — Landing page URL
- `NEXT_PUBLIC_CDN_URL` — CDN domain for user-uploaded images (optional)

## Deployment

The app is configured for Replit autoscale deployment:
- Build: `npm run build` (Next.js production build)
- Start: `npm run start` (Next.js production server)

## Audit History

This codebase has undergone a comprehensive pre-deployment audit (A–P checklist) covering:
- Security (CSP, XSS, CSRF, JWT handling, base64url decoding)
- Authentication (token expiry, session timeout, cross-tab logout, 2FA)
- React best practices (stable keys, error boundaries, hydration safety)
- Accessibility (ARIA labels, keyboard nav, focus management, reduced motion)
- Performance (font self-hosting, image optimization, lazy devtools)
- TypeScript strict mode compliance
- Indonesian locale (IDR formatting, Indonesian UI strings)

### Latest Audit Fixes (March 2026)

**Security:**
- `AuthProvider`: Session timeout (8-hour idle) and JWT expiry now redirect to `/login?session=expired` after clearing local state, preventing the broken state where Zustand is cleared but the server-side refresh cookie remains valid and could silently re-authenticate the user on next API call.

**Features/UX:**
- Auth pages (`verify-email`, `reset-password`, `2fa-verify`, `set-username`, `forgot-password`) converted from `"use client"` + `usePageTitle()` to proper Next.js Server Components with `export const metadata`. This ensures correct SSR page titles from first render (no flash).
- `data-testid` attributes added to all interactive elements across the entire app for automated testing support:
  - Auth forms: LoginForm, RegisterForm, TwoFAForm, ForgotPasswordForm, ResetPasswordForm, SetUsernameForm, VerifyEmailForm
  - App components: AddBankAccountForm, ProfileForm, PinInput, KycRejectedCard, TransactionCard, TopUpModal, DisputeForm, DisputeMessages, UserDropdown, NotificationBell, AppTopbar, Sidebar, BottomNav, OrderTypeSelector, PaymentMethodSelector
  - Pages: escrow, dispute, transaksi list, chat (list + room), referral, profil/keamanan (incl. delete account dialog + password input), profil/kyc (back btn + NIK input + next btn), transaksi/[id] (rating textarea + cancel/submit), wallet/riwayat (back btn + type filter), bantuan (search input + email/whatsapp links)
  - SearchInput in escrow, transaksi, dispute, chat pages
  - Error boundary retry buttons (app/error.tsx, app/(app)/error.tsx)
- `PasswordInput` shared component updated to accept and forward `data-testid` prop
- `CurrencyInput` shared component updated to accept and forward `data-testid` prop (used in TopUpModal, WithdrawModal, CreateTransactionForm)
- `app/(app)/error.tsx` console.error now gated to development-only (matches app/error.tsx pattern)
- Additional pages covered: profil (KYC/security/bank nav buttons), profil/aktivitas, profil/rekening, profil/perangkat (incl. per-device remove), pengaturan (save/discard/unblock), user/[username], transaksi/[id] back btn, sesi (revoke all), langganan (toggle auto-renew/cancel/subscribe), wallet (topup/withdraw/history/change-pin), wallet/topup, wallet/tarik, dispute/buat/[id], dashboard (refresh + quick actions + see all), notifikasi (mark all read)
- `lib/validations/bank-account.schema.ts` TODO cleaned up (bankName already auto-derived from bankCode in the form)
- `ConfirmDialog` shared component updated to accept `confirmTestId` and `cancelTestId` props; all 8 call-sites wired: referral (regenerate code), profil/rekening (delete bank), profil/perangkat (remove device), pengaturan (unblock user), sesi (revoke session + revoke all), langganan (cancel subscription), wallet/topup (cancel pending top-up)
- `wallet/topup` inline `AlertDialogCancel`/`AlertDialogAction` buttons given testids: `button-cancel-topup-confirm`, `button-confirm-topup`
- `DisputeMessages` file-type `SelectTrigger` given dynamic testid `select-evidence-type-${file.id}`
- `TrackingForm` notes `Textarea` given testid `textarea-tracking-notes`
