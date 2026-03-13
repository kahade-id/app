import { z } from 'zod'

export const validateVoucherSchema = z.object({
  code: z.string().min(1, 'Kode voucher wajib diisi').max(50, 'Kode voucher maksimal 50 karakter'),
  orderValue: z.number().int().min(1, 'Nilai order wajib diisi'),
})

export type ValidateVoucherInput = z.infer<typeof validateVoucherSchema>
