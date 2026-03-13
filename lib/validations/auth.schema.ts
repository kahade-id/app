import { z } from 'zod'

// #272 — Stronger password: adds special character requirement
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,128}$/

const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(128, 'Password maksimal 128 karakter')
  .regex(
    passwordRegex,
    'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus (!@#$%^&*)'
  )

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid').max(254).trim(),
  password: z.string().min(1, 'Password wajib diisi').max(128, 'Password maksimal 128 karakter'),
  // C-14 FIX: deviceId must have at least 1 character
  deviceId: z.string().min(1, 'Device ID wajib diisi').max(255),
  deviceInfo: z.string().max(512).optional(),
})

export const registerSchema = z
  .object({
    // H-35 FIX: .trim() on all text fields to reject whitespace-only
    fullName: z.string().trim().min(2, 'Nama minimal 2 karakter').max(60, 'Nama maksimal 60 karakter'),
    email: z.string().email('Email tidak valid').max(254).trim(),
    password: passwordSchema,
    confirmPassword: z.string(),
    agreeTerms: z.literal(true, { errorMap: () => ({ message: 'Anda harus menyetujui syarat dan ketentuan' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export const setUsernameSchema = z.object({
  username: z
    .string()
    .min(4, 'Username minimal 4 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
})

export const verifyEmailSchema = z.object({
  email: z.string().email('Email tidak valid').max(254).trim(),
  otp: z.string().length(6, 'OTP harus 6 digit').regex(/^\d{6}$/, 'OTP harus berupa angka'),
})

export const resendVerificationSchema = z.object({
  email: z.string().email('Email tidak valid').max(254).trim(),
})

export const correctEmailSchema = z.object({
  newEmail: z.string().email('Email tidak valid').max(254).trim(),
  password: z.string().min(1, 'Password wajib diisi').max(128),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid').max(254).trim(),
})

export const resetPasswordSchema = z
  .object({
    email: z.string().email('Email tidak valid').max(254).trim(),
    otp: z.string().length(6, 'OTP harus 6 digit').regex(/^\d{6}$/, 'OTP harus berupa angka'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi').max(128),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
    revokeOtherSessions: z.boolean().optional().default(true),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export const twoFASetupSchema = z.object({
  password: z.string().min(1, 'Password wajib diisi').max(128),
})

export const twoFAEnableSchema = z.object({
  code: z.string().length(6, 'Kode harus 6 digit').regex(/^\d{6}$/, 'Kode harus berupa angka'),
})

export const twoFAVerifyLoginSchema = z.object({
  tempToken: z.string().max(512),
  // H-05 FIX: max(32) to accommodate longer backup codes (some are 8+ chars)
  code: z.string().min(6, 'Kode minimal 6 karakter').max(32, 'Kode maksimal 32 karakter'),
  // C-14 FIX: deviceId min(1)
  deviceId: z.string().min(1, 'Device ID wajib diisi').max(255),
  deviceInfo: z.string().max(512).optional(),
})

export const twoFADisableSchema = z.object({
  code: z.string().min(6, 'Kode minimal 6 karakter').max(32, 'Kode maksimal 32 karakter'),
  emailOtpCode: z.string().length(6, 'OTP harus 6 digit').regex(/^\d{6}$/, 'OTP harus berupa angka'),
})

export const regenerateBackupCodesSchema = z.object({
  password: z.string().min(1, 'Password wajib diisi').max(128),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type SetUsernameInput = z.infer<typeof setUsernameSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type CorrectEmailInput = z.infer<typeof correctEmailSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type TwoFASetupInput = z.infer<typeof twoFASetupSchema>
export type TwoFAEnableInput = z.infer<typeof twoFAEnableSchema>
export type TwoFAVerifyLoginInput = z.infer<typeof twoFAVerifyLoginSchema>
export type TwoFADisableInput = z.infer<typeof twoFADisableSchema>
export type RegenerateBackupCodesInput = z.infer<typeof regenerateBackupCodesSchema>
