import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse } from '@/types/api'
import type { AuthUser, LoginResponse, TwoFALoginResponse, TwoFASetupResponse } from '@/types/auth'

export const authService = {
  register(data: { fullName: string; email: string; password: string; confirmPassword: string }) {
    return api.post<ApiResponse<{ message: string }>>(API.AUTH_REGISTER, data)
  },

  setUsername(data: { username: string }) {
    return api.post<ApiResponse<{ user: AuthUser }>>(API.AUTH_SET_USERNAME, data)
  },

  verifyEmail(data: { email: string; otp: string }) {
    return api.post<ApiResponse<{ message: string }>>(API.AUTH_VERIFY_EMAIL, data)
  },

  resendVerification(data: { email: string }) {
    return api.post<ApiResponse<{ message: string }>>(API.AUTH_RESEND_VERIFICATION, data)
  },

  correctEmail(data: { newEmail: string; password: string }) {
    return api.post<ApiResponse<{ message: string }>>(API.AUTH_CORRECT_EMAIL, data)
  },

  login(data: { email: string; password: string; deviceId: string; deviceInfo?: string }) {
    return api.post<ApiResponse<LoginResponse | TwoFALoginResponse>>(API.AUTH_LOGIN, data)
  },

  verify2FALogin(data: { tempToken: string; code: string; deviceId: string; deviceInfo?: string }) {
    return api.post<ApiResponse<LoginResponse>>(API.AUTH_2FA_VERIFY_LOGIN, data)
  },

  refresh() {
    return api.post<ApiResponse<{ accessToken: string }>>(API.AUTH_REFRESH)
  },

  logout(data?: { logoutAll?: boolean }) {
    return api.post<ApiResponse<null>>(API.AUTH_LOGOUT, data)
  },

  forgotPassword(data: { email: string }) {
    return api.post<ApiResponse<{ message: string }>>(API.AUTH_FORGOT_PASSWORD, data)
  },

  resetPassword(data: { email: string; otp: string; newPassword: string; confirmPassword: string }) {
    return api.post<ApiResponse<{ message: string }>>(API.AUTH_RESET_PASSWORD, data)
  },

  changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string; revokeOtherSessions?: boolean }) {
    return api.post<ApiResponse<{ message: string }>>(API.AUTH_CHANGE_PASSWORD, data)
  },

  setup2FA(data: { password: string }) {
    return api.post<ApiResponse<TwoFASetupResponse>>(API.AUTH_2FA_SETUP, data)
  },

  enable2FA(data: { code: string }) {
    return api.post<ApiResponse<{ backupCodes: string[] }>>(API.AUTH_2FA_ENABLE, data)
  },

  requestDisable2FAOtp() {
    return api.post<ApiResponse<{ message: string }>>(API.AUTH_2FA_REQUEST_DISABLE_OTP)
  },

  disable2FA(data: { code: string; emailOtpCode: string }) {
    return api.post<ApiResponse<{ message: string }>>(API.AUTH_2FA_DISABLE, data)
  },

  regenerateBackupCodes(data: { password: string }) {
    return api.post<ApiResponse<{ backupCodes: string[] }>>(API.AUTH_2FA_BACKUP_CODES, data)
  },
}
