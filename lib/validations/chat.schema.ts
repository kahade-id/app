import { z } from 'zod'

export const sendMessageSchema = z.object({
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
  // #032 FIX: Added .trim().min(1) for TEXT — whitespace-only messages are rejected.
  // Previously ' ' (spaces only) would pass and appear as invisible/blank messages.
  content: z.string().trim().min(1, 'Pesan tidak boleh kosong').max(5000, 'Pesan maksimal 5000 karakter').optional(),
  attachments: z
    .array(
      z.object({
        fileName: z.string().max(255),
        fileUrl: z.string().max(255),
        mimeType: z.string().max(255),
        thumbnailUrl: z.string().max(255).optional(),
        fileSize: z.number().min(1).max(104857600),
      })
    )
    .optional(),
}).refine(
  (data) => data.content || (data.attachments && data.attachments.length > 0),
  { message: 'Pesan atau lampiran wajib diisi' }
)

export type SendMessageInput = z.infer<typeof sendMessageSchema>
