import { z } from 'zod'

export const submitRatingSchema = z.object({
  orderId: z.string().min(1, 'Order ID wajib diisi'),
  stars: z
    .number({ required_error: 'Rating wajib diisi' })
    .int()
    .min(1, 'Rating minimal 1 bintang')
    .max(5, 'Rating maksimal 5 bintang'),
  comment: z.string().max(500, 'Komentar maksimal 500 karakter').optional(),
})

export const updateRatingSchema = z.object({
  stars: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(500, 'Komentar maksimal 500 karakter').optional(),
})

export type SubmitRatingInput = z.infer<typeof submitRatingSchema>
export type UpdateRatingInput = z.infer<typeof updateRatingSchema>
