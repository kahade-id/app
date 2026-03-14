// ── Routes ────────────────────────────────────────────────────
// L-2 NOTE: Route names intentionally mix Indonesian and English:
// Indonesian for user-facing core flows: /transaksi, /notifikasi, /profil, /sesi, /pengaturan, /bantuan, /langganan
// English retained for technical/domain terms: /escrow, /wallet, /dispute, /chat, /referral, /badges, /voucher
// This reflects the product language: core UX is Bahasa Indonesia, technical finance terms stay English.
// If you want full consistency, pick ONE convention and update all route files + middleware + next.config.ts.
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  SET_USERNAME: '/set-username',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  TWO_FA_VERIFY: '/2fa-verify',

  // Public
  SPLASH: '/',
  ONBOARDING: '/onboarding',

  // App
  DASHBOARD: '/beranda',
  TRANSACTIONS: '/transaksi',
  TRANSACTION_NEW: '/transaksi/buat',
  TRANSACTION_DETAIL: (id: string) => `/transaksi/${id}`,
  ESCROW: '/escrow',
  WALLET: '/wallet',
  WALLET_TOPUP: '/wallet/topup',
  WALLET_WITHDRAW: '/wallet/tarik',
  WALLET_HISTORY: '/wallet/riwayat',
  NOTIFICATIONS: '/notifikasi',
  PROFILE: '/profil',
  PROFILE_SECURITY: '/profil/keamanan',
  PROFILE_KYC: '/profil/kyc',
  PROFILE_BANK: '/profil/rekening',
  PROFILE_DEVICES: '/profil/perangkat',
  PROFILE_ACTIVITY: '/profil/aktivitas',
  DISPUTES: '/dispute',
  DISPUTE_DETAIL: (id: string) => `/dispute/${id}`,
  DISPUTE_NEW: (orderId: string) => `/dispute/buat/${orderId}`,
  CHAT: (orderId: string) => `/chat/${orderId}`,
  CHAT_LIST: '/chat',
  BADGES: '/badges',
  VOUCHERS: '/voucher',
  USER_PROFILE: (username: string) => `/user/${username}`,
  RATINGS: '/ratings',
  SUBSCRIPTION: '/langganan',
  REFERRAL: '/referral',
  SESSIONS: '/sesi',
  SETTINGS: '/pengaturan',
  HELP: '/bantuan',

} as const

// ── API Endpoints ─────────────────────────────────────────────
export const API = {
  // Public
  HEALTH: '/health',
  PUBLIC_CONFIG: '/public/config',
  PUBLIC_FEE_SCHEDULE: '/public/fee-schedule',
  PUBLIC_BANKS: '/public/banks',
  PUBLIC_SUBSCRIPTION_PLANS: '/public/subscription-plans',

  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_SET_USERNAME: '/auth/set-username',
  AUTH_VERIFY_EMAIL: '/auth/verify-email',
  AUTH_RESEND_VERIFICATION: '/auth/resend-verification',
  AUTH_CORRECT_EMAIL: '/auth/correct-email',
  AUTH_LOGIN: '/auth/login',
  AUTH_2FA_VERIFY_LOGIN: '/auth/2fa/verify-login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  AUTH_CHANGE_PASSWORD: '/auth/change-password',
  AUTH_2FA_SETUP: '/auth/2fa/setup',
  AUTH_2FA_ENABLE: '/auth/2fa/enable',
  AUTH_2FA_REQUEST_DISABLE_OTP: '/auth/2fa/request-disable-otp',
  AUTH_2FA_DISABLE: '/auth/2fa/disable',
  AUTH_2FA_BACKUP_CODES: '/auth/2fa/backup-codes/regenerate',

  // Users
  USERS_ME: '/users/me',
  USERS_UPDATE_PROFILE: '/users/me',
  USERS_UPLOAD_AVATAR: '/users/me/avatar',
  USERS_AVATAR_CONFIRM: '/users/me/avatar/confirm',
  USERS_DELETE_AVATAR: '/users/me/avatar',
  USERS_STATS: '/users/me/stats',
  USERS_DELETE_REQUEST: '/users/me/delete-request',
  USERS_AVAILABILITY: '/users/availability',
  USERS_SEARCH: '/users/search',
  USERS_DEVICES: '/users/me/devices',
  USERS_DEVICE_DELETE: (deviceId: string) => `/users/me/devices/${deviceId}`,
  USERS_ACTIVITY_LOG: '/users/me/activity-log',
  USERS_PROFILE: (username: string) => `/users/${username}`,
  USERS_RATINGS: (username: string) => `/users/${username}/ratings`,
  USERS_AUDIT_LOG: '/users/me/audit-log',

  // Sessions
  // #079 FIX: SESSIONS_LIST and SESSIONS_REVOKE_ALL intentionally use the same path.
  // They differ only in HTTP method: GET /sessions (list) vs DELETE /sessions (revoke all).
  // Use the correct constant name to communicate your intended HTTP verb to future maintainers.
  SESSIONS_LIST: '/sessions',         // GET /sessions
  SESSIONS_REVOKE: (id: string) => `/sessions/${id}`,
  SESSIONS_REVOKE_ALL: '/sessions',   // DELETE /sessions
  SESSIONS_REVOKE_OTHERS: '/sessions/others',

  // KYC
  KYC_SUBMIT: '/kyc/submit',
  KYC_STATUS: '/kyc/status',
  KYC_HISTORY: '/kyc/history',
  KYC_RESUBMIT: '/kyc/resubmit',

  // Upload
  UPLOAD_PRESIGNED_URL: '/upload/presigned-url',
  UPLOAD_CONFIRM: '/upload/confirm',

  // Orders
  ORDERS_LIST: '/orders',
  ORDERS_CREATE: '/orders',
  ORDERS_SUMMARY: '/orders/summary',
  ORDERS_VALIDATE_COUNTERPART: '/orders/validate-counterpart',
  ORDERS_CALCULATE_FEE: '/orders/calculate-fee',
  ORDERS_DETAIL: (id: string) => `/orders/${id}`,
  ORDERS_CONFIRM: (id: string) => `/orders/${id}/confirm`,
  ORDERS_REJECT: (id: string) => `/orders/${id}/reject`,
  ORDERS_PAY: (id: string) => `/orders/${id}/pay`,
  ORDERS_MARK_PROCESSING: (id: string) => `/orders/${id}/processing`,
  ORDERS_PROCESS: (id: string) => `/orders/${id}/process`,
  ORDERS_SHIP: (id: string) => `/orders/${id}/ship`,
  ORDERS_SHIPPING_UPDATE: (id: string) => `/orders/${id}/shipping`,
  ORDERS_COMPLETE: (id: string) => `/orders/${id}/complete`,
  ORDERS_CANCEL: (id: string) => `/orders/${id}/cancel`,
  ORDERS_DISPUTE: (id: string) => `/orders/${id}/dispute`,
  ORDERS_HISTORY: (id: string) => `/orders/${id}/history`,
  ORDERS_EXTENSIONS: (id: string) => `/orders/${id}/extensions`,
  ORDERS_EXTENSION_RESPOND: (id: string, extId: string) => `/orders/${id}/extensions/${extId}`,

  // Wallet
  WALLET_GET: '/wallet',
  WALLET_TOPUP: '/wallet/topup',
  WALLET_TOPUP_CANCEL: (txId: string) => `/wallet/topup/${txId}/cancel`,
  WALLET_TOPUP_HISTORY: '/wallet/topup-history',
  WALLET_WITHDRAW: '/wallet/withdraw',
  WALLET_WITHDRAW_CONFIRM_OTP: '/wallet/withdraw/confirm-otp',
  WALLET_WITHDRAW_HISTORY: '/wallet/withdraw-history',
  WALLET_HISTORY: '/wallet/transactions',
  WALLET_TRANSACTION_DETAIL: (txId: string) => `/wallet/transactions/${txId}`,
  WALLET_PAYMENT_METHODS: '/wallet/payment-methods',
  WALLET_PIN_SET: '/wallet/set-pin',
  WALLET_PIN_CHANGE: '/wallet/pin/change',
  WALLET_PIN_VERIFY: '/wallet/verify-pin',

  // Bank Accounts
  BANK_ACCOUNTS_LIST: '/bank-accounts',
  BANK_ACCOUNTS_CREATE: '/bank-accounts',
  BANK_ACCOUNTS_DELETE: (id: string) => `/bank-accounts/${id}`,
  BANK_ACCOUNTS_SET_PRIMARY: (id: string) => `/bank-accounts/${id}/set-primary`,

  // Payments
  PAYMENT_STATUS: (midtransOrderId: string) => `/payment/status/${midtransOrderId}`,

  // Disputes
  DISPUTES_MY: '/disputes/my',
  DISPUTES_SUBMIT_CLAIM: (orderId: string) => `/disputes/${orderId}/claim`,
  DISPUTES_DETAIL: (id: string) => `/disputes/${id}`,
  DISPUTES_SUBMIT_EVIDENCE: (id: string) => `/disputes/${id}/evidence`,

  // Chat
  CHAT_ROOMS: '/chat/rooms',
  CHAT_ROOM_MESSAGES: (roomId: string) => `/chat/rooms/${roomId}/messages`,
  CHAT_ROOM_SEND: (roomId: string) => `/chat/rooms/${roomId}/messages`,
  CHAT_ROOM_READ: (roomId: string) => `/chat/rooms/${roomId}/read`,
  CHAT_ROOM_DELETE_MESSAGE: (roomId: string, messageId: string) => `/chat/rooms/${roomId}/messages/${messageId}`,
  CHAT_ROOM_ATTACHMENTS: (roomId: string) => `/chat/rooms/${roomId}/attachments`,
  CHAT_MESSAGES: (orderId: string) => `/chat/${orderId}/messages`,
  CHAT_SEND: (orderId: string) => `/chat/${orderId}/messages`,
  CHAT_PRESIGNED_URL: (orderId: string) => `/chat/${orderId}/presigned-url`,

  // Ratings
  RATINGS_CREATE: '/ratings',
  RATINGS_SUBMIT: (orderId: string) => `/ratings/${orderId}`,
  RATINGS_UPDATE: (ratingId: string) => `/ratings/${ratingId}`,
  RATINGS_MY: '/ratings/my',

  // Notifications
  NOTIFICATIONS_LIST: '/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',
  NOTIFICATIONS_MARK_READ: (id: string) => `/notifications/${id}/read`,
  NOTIFICATIONS_DELETE: (id: string) => `/notifications/${id}`,
  NOTIFICATIONS_MARK_ALL_READ: '/notifications/read-all',
  NOTIFICATIONS_PREFERENCES: '/notifications/preferences',
  NOTIFICATIONS_UPDATE_PREFERENCES: '/notifications/preferences',
  NOTIFICATIONS_REGISTER_DEVICE: '/notifications/register-device',

  // Vouchers
  VOUCHERS_VALIDATE: '/vouchers/validate',
  VOUCHERS_AVAILABLE: '/vouchers/available',
  VOUCHERS_MY_USAGE: '/vouchers/my-usage',

  // Subscriptions
  SUBSCRIPTIONS_STATUS: '/subscriptions/status',
  SUBSCRIPTIONS_PLANS: '/subscriptions/plans',
  SUBSCRIPTIONS_BENEFITS: '/subscriptions/benefits',
  SUBSCRIPTIONS_SUBSCRIBE: '/subscriptions/subscribe',
  SUBSCRIPTIONS_RENEW: '/subscriptions/renew',
  SUBSCRIPTIONS_CANCEL: '/subscriptions/cancel',
  SUBSCRIPTIONS_TOGGLE_AUTO_RENEW: '/subscriptions/auto-renew',
  SUBSCRIPTIONS_HISTORY: '/subscriptions/history',

  // Referral
  REFERRAL_MY: '/referral/my-code',
  REFERRAL_STATS: '/referral/stats',
  REFERRAL_REWARDS: '/referral/rewards',
  REFERRAL_APPLY: '/referral/apply',
  REFERRAL_REGENERATE: '/referral/regenerate',
  REFERRAL_HISTORY: '/referral/history',

  // Badges
  BADGES_LIST: '/badges',
  BADGES_MY: '/badges/my',

  // Settings
  SETTINGS_PRIVACY: '/settings/privacy',
  SETTINGS_LANGUAGE: '/settings/language',
  // L-08 FIX: SETTINGS_BLOCK_USER and SETTINGS_UNBLOCK_USER intentionally share
  // the same URL pattern — they differ only in HTTP method.
  // POST   /settings/block/:userId → block user
  // DELETE /settings/block/:userId → unblock user
  SETTINGS_BLOCK_USER: (userId: string) => `/settings/block/${userId}`,   // POST
  SETTINGS_UNBLOCK_USER: (userId: string) => `/settings/block/${userId}`, // DELETE
  SETTINGS_BLOCKED_LIST: '/settings/blocked-users',
  SETTINGS_REPORT_USER: '/settings/report',
  SETTINGS_MY_REPORTS: '/settings/reports',

} as const

// ── Status Labels (Bahasa Indonesia) ─────────────────────────
export const ORDER_STATUS_LABELS: Record<string, string> = {
  WAITING_CONFIRMATION: 'Menunggu Konfirmasi',
  WAITING_PAYMENT:      'Menunggu Pembayaran',
  PROCESSING:           'Diproses',
  IN_DELIVERY:          'Dalam Pengiriman',
  COMPLETED:            'Selesai',
  DISPUTED:             'Dalam Sengketa',
  CANCELLED:            'Dibatalkan',
}

export const KYC_STATUS_LABELS: Record<string, string> = {
  UNVERIFIED: 'Belum Terverifikasi',
  PENDING:    'Menunggu Review',
  APPROVED:   'Terverifikasi',
  REJECTED:   'Ditolak',
  REVOKED:    'Dicabut',
}

export const DISPUTE_STATUS_LABELS: Record<string, string> = {
  OPEN:             'Terbuka',
  ASSIGNED:         'Ditugaskan',
  UNDER_REVIEW:     'Dalam Review',
  WAITING_RESPONSE: 'Menunggu Respons',
  RESOLVED:         'Selesai',
  ESCALATED:        'Dieskalasi',
}

export const WALLET_TX_LABELS: Record<string, string> = {
  TOP_UP:              'Top Up',
  WITHDRAW:            'Penarikan',
  ORDER_LOCK:          'Dana Escrow',
  ORDER_RELEASE:       'Dana Dilepas',
  ORDER_REFUND:        'Pengembalian Dana',
  FEE_DEDUCT:          'Biaya Platform',
  REFERRAL_REWARD:     'Hadiah Referral',
  SUBSCRIPTION_PAYMENT:'Pembayaran Langganan',
  ADMIN_CREDIT:        'Kredit Admin',
  ADMIN_DEBIT:         'Debit Admin',
  DISPUTE_RELEASE:     'Dana Dispute Dilepas',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  VIRTUAL_ACCOUNT_BCA:     'Virtual Account BCA',
  VIRTUAL_ACCOUNT_BNI:     'Virtual Account BNI',
  VIRTUAL_ACCOUNT_BRI:     'Virtual Account BRI',
  VIRTUAL_ACCOUNT_MANDIRI: 'Virtual Account Mandiri',
  VIRTUAL_ACCOUNT_CIMB:    'Virtual Account CIMB',
  VIRTUAL_ACCOUNT_PERMATA: 'Virtual Account Permata',
  // C-16 FIX: Added missing entries that exist in PaymentMethod type
  VIRTUAL_ACCOUNT_OTHER:   'Virtual Account Lainnya',
  CREDIT_CARD:             'Kartu Kredit',
  QRIS:                    'QRIS',
  GOPAY:                   'GoPay',
  SHOPEEPAY:               'ShopeePay',
  OVO:                     'OVO',
  DANA:                    'DANA',
  KAHADE_WALLET:           'Dompet Kahade',
}

export const MEMBERSHIP_RANK_LABELS: Record<string, string> = {
  BRONZE:   'Bronze',
  SILVER:   'Silver',
  GOLD:     'Gold',
  PLATINUM: 'Platinum',
  DIAMOND:  'Diamond',
}

// L-3 FIX: Removed status keys that don't exist in WalletTransactionStatus type:
// PROCESSING, EXPIRED, REFUNDED, PENDING_OTP, PENDING_PROCESS — these belong to
// WithdrawStatus or are legacy values. Keeping only keys from WalletTransactionStatus
// ('PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REVERSED') plus COMPLETED which
// is a common extension. Unlabeled statuses returned by the API will now fall through
// to a raw display instead of silently mapping to a wrong label.
export const WALLET_TX_STATUS_LABELS: Record<string, string> = {
  PENDING:    'Tertunda',
  SUCCESS:    'Berhasil',
  FAILED:     'Gagal',
  CANCELLED:  'Dibatalkan',
  REVERSED:   'Dikembalikan',
  // WithdrawStatus labels — kept separate for withdraw transaction display
  PROCESSING:      'Diproses',
  PENDING_OTP:     'Menunggu OTP',
  PENDING_PROCESS: 'Menunggu Proses',
  // Legacy/extended
  COMPLETED:    'Selesai',
  EXPIRED:      'Kedaluwarsa',
  REFUNDED:     'Dikembalikan',
}

// ── Misc ──────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10
export const MAX_AVATAR_SIZE_MB = 2
export const MAX_KYC_FILE_SIZE_MB = 5
export const MAX_EVIDENCE_FILE_SIZE_MB = 5
export const MAX_CHAT_FILE_SIZE_MB = 5
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', ...ACCEPTED_IMAGE_TYPES]
