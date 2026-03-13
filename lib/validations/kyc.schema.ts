import { z } from 'zod'

export const kycSubmitSchema = z.object({
  ktpPhotoUrl: z.string().min(1, 'Foto KTP wajib diunggah'),
  selfiePhotoUrl: z.string().min(1, 'Foto selfie wajib diunggah'),
  nik: z
    .string()
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d{16}$/, 'NIK harus berupa angka'),
  // H-6 FIX: ktpNumber was present in KycSubmitDto type but missing from this schema,
  // causing it to be sent to the server without any client-side validation.
  // Made optional to match the type (ktpNumber?: string).
  ktpNumber: z.string().optional(),
})

export type KycSubmitInput = z.infer<typeof kycSubmitSchema>
