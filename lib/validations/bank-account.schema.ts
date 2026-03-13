import { z } from 'zod'

// #059 FIX: bankName is derived from bankCode in AddBankAccountForm — when the user
// selects a bank from the dropdown, bankName is auto-set via form.setValue so it always
// matches the selected bankCode. The schema accepts both; consistency is enforced in the UI.
export const addBankAccountSchema = z.object({
  bankCode: z.string().min(1, 'Pilih bank'),
  bankName: z.string().min(1, 'Nama bank wajib diisi'),
  accountNumber: z
    .string()
    .min(6, 'Nomor rekening minimal 6 digit')
    .max(20, 'Nomor rekening maksimal 20 digit')
    .regex(/^\d+$/, 'Nomor rekening harus berupa angka'),
  accountName: z
    .string()
    .min(2, 'Nama pemilik rekening minimal 2 karakter')
    .max(100, 'Nama pemilik rekening maksimal 100 karakter'),
})

export type AddBankAccountInput = z.infer<typeof addBankAccountSchema>
