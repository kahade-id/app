import { z } from 'zod'

// #057 FIX: fullName is required (not optional) in updateProfileSchema.
// The UI always sends fullName, so marking it optional was misleading — it implied
// partial updates were supported when they aren't. Made required and consistent.
// #030 FIX: Standardised fullName max to 60 chars (matches registerSchema / DB column).
export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Nama wajib diisi').max(60, 'Nama maksimal 60 karakter'),
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional(),
  accountType: z.enum(['PERSONAL', 'BUSINESS']).optional(),
})

export const privacySettingsSchema = z.object({
  profileVisible: z.boolean().optional(),
  showOnlineStatus: z.boolean().optional(),
})

// #060 FIX: language now validated against explicit list of supported locales,
// not just string length. Prevents invalid values like 'xx' or 'zz' being stored.
export const languageSettingsSchema = z.object({
  language: z.enum(['id', 'en'], {
    errorMap: () => ({ message: "Pilih bahasa yang didukung: 'id' atau 'en'" }),
  }),
})

export const reportUserSchema = z.object({
  // L-19 NOTE: targetId regex /^USR-[A-Z0-9]{8,}$/ is hardcoded here.
  // If the backend changes the user ID format (e.g. to UUID or a different prefix),
  // this regex will silently reject valid IDs on the client while the server accepts them.
  // To make this more resilient: either relax the regex to just /^[A-Z0-9-]{8,}$/
  // (accepts any uppercase alphanumeric ID with dashes), or load the pattern from a
  // shared constants file that is updated alongside the backend ID format.
  // Current format assumption: "USR-" followed by 8+ uppercase alphanumeric chars.
  targetId: z
    .string()
    .min(1, 'Target wajib diisi')
    .regex(/^USR-[A-Z0-9]{8,}$/, 'Format target ID tidak valid'),
  category: z.enum(['FRAUD', 'HARASSMENT', 'SPAM', 'FAKE_ACCOUNT', 'OTHER'], {
    required_error: 'Pilih kategori laporan',
  }),
  // #081 FIX: Added .max(2000) to prevent unbounded description input
  description: z.string().min(1, 'Deskripsi wajib diisi').max(2000, 'Deskripsi maksimal 2000 karakter'),
  evidenceUrls: z.array(z.string()).optional(),
  relatedOrderId: z.string().optional(),
  relatedMessageId: z.string().optional(),
})

export const notificationPreferencesSchema = z.object({
  orderInApp: z.boolean().optional(),
  orderEmail: z.boolean().optional(),
  walletInApp: z.boolean().optional(),
  walletEmail: z.boolean().optional(),
  securityInApp: z.boolean().optional(),
  securityEmail: z.boolean().optional(),
  chatInApp: z.boolean().optional(),
  disputeInApp: z.boolean().optional(),
  disputeEmail: z.boolean().optional(),
  rankingInApp: z.boolean().optional(),
  marketingEmail: z.boolean().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>
export type LanguageSettingsInput = z.infer<typeof languageSettingsSchema>
export type ReportUserInput = z.infer<typeof reportUserSchema>
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>
