import { z } from 'zod'
import type { PaymentMethod } from '@/types/wallet'

const PAYMENT_METHOD_VALUES = [
  'VIRTUAL_ACCOUNT_BCA',
  'VIRTUAL_ACCOUNT_BNI',
  'VIRTUAL_ACCOUNT_BRI',
  'VIRTUAL_ACCOUNT_MANDIRI',
  'VIRTUAL_ACCOUNT_CIMB',
  'VIRTUAL_ACCOUNT_PERMATA',
  'VIRTUAL_ACCOUNT_OTHER',
  'QRIS',
  'GOPAY',
  'SHOPEEPAY',
  'OVO',
  'DANA',
  'CREDIT_CARD',
  'KAHADE_WALLET',
] as const satisfies readonly PaymentMethod[]

// #007 FIX: Added .max() to prevent absurdly large amounts (e.g. 999999999999999)
// that could cause integer overflow downstream. Rp 10 billion is a reasonable ceiling.
const MAX_TRANSACTION_AMOUNT = 10_000_000_000 // Rp 10 billion

export const topUpSchema = z.object({
  amount: z
    .number({ required_error: 'Jumlah wajib diisi' })
    .min(10000, 'Minimal top up Rp 10.000')
    .max(MAX_TRANSACTION_AMOUNT, 'Jumlah melebihi batas maksimum'),
  method: z.enum(PAYMENT_METHOD_VALUES, {
    required_error: 'Pilih metode pembayaran',
    invalid_type_error: 'Metode pembayaran tidak valid',
  }),
})

export const withdrawSchema = z.object({
  amount: z
    .number({ required_error: 'Jumlah wajib diisi' })
    // M-15 NOTE: Client-side max cannot be validated against wallet.availableBalance here
    // because Zod schemas are defined statically at module level without access to runtime state.
    // To enforce balance limit on client: use .superRefine() or .max(balance) at the call site
    // in the form component where availableBalance is known. Server will always be the
    // authoritative check for over-balance withdrawals.
    .min(50000, 'Minimal penarikan Rp 50.000')
    .max(MAX_TRANSACTION_AMOUNT, 'Jumlah melebihi batas maksimum'),
  bankAccountId: z.string().min(1, 'Pilih rekening bank').max(255),
  // #11 FIX: Tambah PIN ke withdrawSchema agar validasi konsisten lewat Zod,
  // bukan cek manual terpisah yang bisa diverge dari schema
  pin: z.string().length(6, 'PIN harus 6 digit').regex(/^\d{6}$/, 'PIN harus berupa angka'),
})

export const withdrawConfirmOtpSchema = z.object({
  txId: z.string().max(255),
  otp: z.string().length(6, 'OTP harus 6 digit').regex(/^\d{6}$/, 'OTP harus berupa angka'),
})

// #080 FIX: Deduplicate — a single pinSchema used by set, verify, and change
const pinSchema = z.string().length(6, 'PIN harus 6 digit').regex(/^\d{6}$/, 'PIN harus berupa angka')

export const setPinSchema = z.object({
  pin: pinSchema,
})

export const verifyPinSchema = z.object({
  pin: pinSchema,
})

// #034/#054 FIX: changePinSchema was missing entirely — added with proper validation
export const changePinSchema = z.object({
  currentPin: pinSchema,
  newPin: pinSchema,
}).refine((data) => data.currentPin !== data.newPin, {
  message: 'PIN baru tidak boleh sama dengan PIN lama',
  path: ['newPin'],
})

export type TopUpInput = z.infer<typeof topUpSchema>
export type WithdrawInput = z.infer<typeof withdrawSchema>
export type WithdrawConfirmOtpInput = z.infer<typeof withdrawConfirmOtpSchema>
export type SetPinInput = z.infer<typeof setPinSchema>
export type VerifyPinInput = z.infer<typeof verifyPinSchema>
export type ChangePinInput = z.infer<typeof changePinSchema>
