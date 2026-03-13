import { z } from 'zod'

export const createOrderSchema = z.object({
  role: z.enum(['BUYER', 'SELLER'], { required_error: 'Pilih peran Anda' }),
  // M-42 FIX: Validate username format (alphanumeric + underscore only)
  counterpartUsername: z.string()
    .min(1, 'Username lawan transaksi wajib diisi')
    .max(30, 'Username maksimal 30 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
  // H-35 FIX: .trim() to reject whitespace-only
  title: z.string().trim().min(1, 'Judul wajib diisi').max(100, 'Judul maksimal 100 karakter'),
  description: z.string().trim().min(1, 'Deskripsi wajib diisi').max(1000, 'Deskripsi maksimal 1000 karakter'),
  orderType: z.enum(['PHYSICAL_GOODS', 'DIGITAL_GOODS', 'SERVICE', 'OTHER'], { required_error: 'Pilih jenis transaksi' }),
  // #27 NOTE: max(1_000_000_000) = Rp 1 Miliar — intentionally lebih kecil dari
  // topUpSchema/withdrawSchema yang max(10_000_000_000) = Rp 10 Miliar.
  // Alasan: transaksi escrow C2C dibatasi lebih ketat untuk membatasi risiko per-transaksi,
  // sedangkan top up/withdraw adalah operasi wallet yang bisa lebih besar.
  // Jika limit ini berubah, update juga prop max={1000000000} di CurrencyInput
  // pada CreateTransactionForm.tsx agar konsisten.
  orderValue: z
    .number({ required_error: 'Nilai transaksi wajib diisi' })
    .int('Nilai harus bilangan bulat')
    .min(10000, 'Nilai minimal Rp 10.000')
    .max(1_000_000_000, 'Nilai maksimal Rp 1.000.000.000'),
  deliveryDeadlineDays: z
    .number({ required_error: 'Batas waktu pengiriman wajib diisi' })
    .int()
    .min(1, 'Minimal 1 hari')
    .max(30, 'Maksimal 30 hari'),
  feeResponsibility: z.enum(['BUYER', 'SELLER', 'SPLIT'], { required_error: 'Pilih penanggung biaya' }),
  voucherCode: z.string().trim().max(50).optional(),
})

export const confirmOrderSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT']),
  // H-33 FIX: max length for rejection reason
  reason: z.string().max(500).optional(),
}).refine(
  (data) => data.action !== 'REJECT' || (data.reason && data.reason.trim().length > 0),
  { message: 'Alasan wajib diisi saat menolak', path: ['reason'] }
)

export const cancelOrderSchema = z.object({
  // H-27 FIX: max length for cancellation reason
  reason: z.string().trim().min(1, 'Alasan pembatalan wajib diisi').max(500, 'Alasan maksimal 500 karakter'),
})

export const shippingSchema = z.object({
  // H-25 FIX: max length for tracking number
  trackingNumber: z.string().trim().min(1, 'Nomor resi wajib diisi').max(50, 'Nomor resi maksimal 50 karakter'),
  // H-26 FIX: max length for courier name
  courierName: z.string().trim().min(1, 'Nama kurir wajib diisi').max(50, 'Nama kurir maksimal 50 karakter'),
  trackingNotes: z.string().max(500).optional(),
})

export const extensionRequestSchema = z.object({
  extensionDays: z
    .number({ required_error: 'Jumlah hari wajib diisi' })
    .int()
    .min(1, 'Minimal 1 hari')
    .max(30, 'Maksimal 30 hari'),
  // H-28 FIX: max length for extension reason
  reason: z.string().trim().min(1, 'Alasan wajib diisi').max(500, 'Alasan maksimal 500 karakter'),
})

export const extensionRespondSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  note: z.string().max(500).optional(),
})

export const calculateFeeSchema = z.object({
  orderValue: z.number().int().min(10000, 'Nilai minimal Rp 10.000'),
  feeResponsibility: z.enum(['BUYER', 'SELLER', 'SPLIT']),
  voucherCode: z.string().trim().max(50).optional(),
})

export const validateCounterpartSchema = z.object({
  // M-42 FIX: Validate username format
  username: z.string()
    .min(1, 'Username wajib diisi')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Format username tidak valid'),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type ConfirmOrderInput = z.infer<typeof confirmOrderSchema>
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>
export type ShippingInput = z.infer<typeof shippingSchema>
export type ExtensionRequestInput = z.infer<typeof extensionRequestSchema>
export type ExtensionRespondInput = z.infer<typeof extensionRespondSchema>
export type CalculateFeeInput = z.infer<typeof calculateFeeSchema>
export type ValidateCounterpartInput = z.infer<typeof validateCounterpartSchema>
