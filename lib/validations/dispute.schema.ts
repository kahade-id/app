import { z } from 'zod'

export const submitDisputeClaimSchema = z.object({
  claim: z.string().min(20, 'Klaim minimal 20 karakter').max(5000, 'Klaim maksimal 5000 karakter'),
  // #061 FIX: Removed redundant .optional() — .default([]) already ensures the
  // field is never undefined, making .optional() misleading and confusing.
  fileUrls: z
    .array(z.string().max(512))
    .min(0)
    .max(10, 'Maksimal 10 bukti')
    .default([]),
  fileTypes: z.array(z.string().max(64)).default([]),
})

export const submitEvidenceSchema = z.object({
  description: z.string().min(1, 'Deskripsi bukti wajib diisi'),
  fileUrls: z.array(z.string().max(512)).min(1, 'Minimal 1 file bukti'),
  fileTypes: z.array(z.string().max(64)),
})

export const updateClaimSchema = z.object({
  claim: z.string().min(1, 'Klaim wajib diisi').max(5000, 'Klaim maksimal 5000 karakter'),
})

export type SubmitDisputeClaimInput = z.infer<typeof submitDisputeClaimSchema>
export type SubmitEvidenceInput = z.infer<typeof submitEvidenceSchema>
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>
