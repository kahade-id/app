'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService } from '@/lib/services/auth.service'
import { useAuthStore } from '@/lib/stores/auth.store'
import { ROUTES } from '@/lib/constants'
import type { LoginResponse, TwoFALoginResponse } from '@/types/auth'
// C-17: Use SSR-safe storage utility instead of raw sessionStorage
import { safeSessionStorage } from '@/lib/safe-storage'

import { AUTH_ROUTES as AUTH_PATHS } from '@/lib/route-constants'

function isValidRedirect(path: string | null | undefined): path is string {
  if (!path) return false
  if (!path.startsWith('/')) return false
  // M-07 FIX: Additional checks — prevent protocol-relative URLs, URL-encoded
  // schemes, and null-byte injection that could bypass the leading-slash check.
  if (path.startsWith('//')) return false
  if (/%2f%2f/i.test(path)) return false  // URL-encoded //
  if (/%00/i.test(path)) return false      // null byte
  if (path.includes('\0')) return false    // null byte literal
  return !AUTH_PATHS.some(auth => path === auth || path.startsWith(auth + '/'))
}

export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (_, variables) => {
      toast.success('Registrasi berhasil! Silakan verifikasi email Anda.')
      router.push(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(variables.email)}`)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mendaftar'))
    },
  })
}

export function useLogin() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)

  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ data: res }) => {
      // LOGIN-SUCCESS-CHECK FIX: Always verify res.success before processing.
      // If the backend returns HTTP 200 with { success: false, data: {...} }
      // (e.g. banned account, unverified email), we must NOT proceed to login()
      // and redirect — the data field being non-null is not enough.
      if (!res.success) {
        toast.error(res.message || 'Email atau password salah. Silakan coba lagi.')
        return
      }

      const result = res.data
      if (!result) {
        toast.error('Respons server tidak valid. Silakan coba lagi.')
        return
      }

      if ('requires2FA' in result && (result as TwoFALoginResponse).requires2FA) {
        const twoFaResult = result as TwoFALoginResponse
        // #16 FIX: Simpan tempToken dengan expiry timestamp (15 menit) agar bisa
        // di-clear otomatis jika user navigasi ke /login tanpa menyelesaikan 2FA.
        const expiresAt = Date.now() + 15 * 60 * 1000
        safeSessionStorage.setItem('kahade_2fa_temp', twoFaResult.tempToken)
        safeSessionStorage.setItem('kahade_2fa_temp_exp', String(expiresAt))
        // UX-004 FIX: Use Next.js router for URL params instead of window.location.search
        // which bypasses React routing and can be inconsistent with Next.js state.
        const currentUrl = typeof window !== 'undefined' ? new URL(window.location.href) : null
        const redirectTo = currentUrl?.searchParams.get('redirect') ?? null
        const redirectParam = isValidRedirect(redirectTo) ? `?redirect=${encodeURIComponent(redirectTo)}` : ''
        // H-03 FIX: Inform user that 2FA is required before redirecting
        toast.info('Masukkan kode 2FA Anda untuk melanjutkan')
        router.push(`${ROUTES.TWO_FA_VERIFY}${redirectParam}`)
        return
      }

      const loginResult = result as LoginResponse
      login(loginResult.user, loginResult.accessToken)
      toast.success('Login berhasil!')

      if (!loginResult.user.username) {
        router.push(ROUTES.SET_USERNAME)
      } else {
        const currentUrl = typeof window !== 'undefined' ? new URL(window.location.href) : null
        const redirectTo = currentUrl?.searchParams.get('redirect') ?? null
        router.push(isValidRedirect(redirectTo) ? redirectTo : ROUTES.DASHBOARD)
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Email atau password salah'))
    },
  })
}

export function useVerify2FALogin() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)

  return useMutation({
    mutationFn: authService.verify2FALogin,
    onSuccess: ({ data: res }) => {
      const result = res.data
      if (!result) {
        toast.error('Respons server tidak valid. Silakan coba lagi.')
        return
      }
      login(result.user, result.accessToken)
      // #16 FIX: Hapus juga key expiry saat token berhasil diverifikasi
      safeSessionStorage.removeItem('kahade_2fa_temp')
      safeSessionStorage.removeItem('kahade_2fa_temp_exp')
      toast.success('Verifikasi 2FA berhasil!')
      // UX-004 FIX: Use URL constructor instead of raw window.location.search
      const currentUrl = typeof window !== 'undefined' ? new URL(window.location.href) : null
      const redirectTo = currentUrl?.searchParams.get('redirect') ?? null
      router.push(isValidRedirect(redirectTo) ? redirectTo : ROUTES.DASHBOARD)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Kode 2FA salah'))
    },
  })
}

export function useSetUsername() {
  const router = useRouter()
  const updateUser = useAuthStore((s) => s.updateUser)

  return useMutation({
    mutationFn: authService.setUsername,
    onSuccess: ({ data: res }) => {
      if (res.data?.user) {
        updateUser(res.data.user)
      }
      toast.success('Username berhasil diatur!')
      router.push(ROUTES.DASHBOARD)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengatur username'))
    },
  })
}

export function useVerifyEmail() {
  const router = useRouter()

  return useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: () => {
      toast.success('Email berhasil diverifikasi!')
      router.push(ROUTES.LOGIN)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal memverifikasi email'))
    },
  })
}

// M-3 NOTE: resendCooldownUntil is intentionally module-level (not component state).
// Module-level state persists across component unmount/remount (e.g. navigating away
// and back to verify-email page) so the 60s cooldown can't be bypassed by re-mounting.
// Trade-off: it also persists across hot-reload in dev. This is acceptable behaviour.
// It does NOT persist across full page refresh, which resets the cooldown correctly.
let resendCooldownUntil = 0
const RESEND_COOLDOWN_MS = 60_000 // 60 seconds

export function useResendVerification() {
  return useMutation({
    mutationFn: (data: Parameters<typeof authService.resendVerification>[0]) => {
      const now = Date.now()
      if (now < resendCooldownUntil) {
        const remaining = Math.ceil((resendCooldownUntil - now) / 1000)
        return Promise.reject(new Error(`Tunggu ${remaining} detik sebelum mengirim ulang.`))
      }
      return authService.resendVerification(data)
    },
    onSuccess: () => {
      resendCooldownUntil = Date.now() + RESEND_COOLDOWN_MS
      toast.success('Email verifikasi telah dikirim ulang. Tunggu 60 detik sebelum mengirim lagi.')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengirim ulang verifikasi'))
    },
  })
}

export function useCorrectEmail() {
  return useMutation({
    mutationFn: authService.correctEmail,
    onSuccess: () => {
      toast.success('Email berhasil dikoreksi. Cek email baru Anda.')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengoreksi email'))
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast.success('Kode OTP reset password telah dikirim ke email Anda')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengirim kode reset password'))
    },
  })
}

export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success('Password berhasil direset!')
      router.push(ROUTES.LOGIN)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mereset password'))
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password berhasil diubah')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengubah password'))
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout()
      queryClient.clear()
      router.push(ROUTES.LOGIN)
    },
    onError: () => {
      logout()
      queryClient.clear()
      router.push(ROUTES.LOGIN)
    },
  })
}

export function useSetup2FA() {
  return useMutation({
    mutationFn: authService.setup2FA,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal setup 2FA'))
    },
  })
}

export function useEnable2FA() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((s) => s.updateUser)

  return useMutation({
    mutationFn: authService.enable2FA,
    onSuccess: () => {
      updateUser({ isMfaEnabled: true })
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('2FA berhasil diaktifkan')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengaktifkan 2FA'))
    },
  })
}

export function useRequestDisable2FAOtp() {
  return useMutation({
    mutationFn: authService.requestDisable2FAOtp,
    onSuccess: () => {
      toast.success('Kode OTP telah dikirim ke email Anda')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengirim OTP'))
    },
  })
}

export function useDisable2FA() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((s) => s.updateUser)

  return useMutation({
    mutationFn: authService.disable2FA,
    onSuccess: () => {
      updateUser({ isMfaEnabled: false })
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('2FA berhasil dinonaktifkan')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menonaktifkan 2FA'))
    },
  })
}

export function useRegenerateBackupCodes() {
  return useMutation({
    mutationFn: authService.regenerateBackupCodes,
    onSuccess: () => {
      toast.success('Backup codes berhasil di-generate ulang')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal generate backup codes'))
    },
  })
}
