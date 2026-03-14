export const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/set-username',
  '/2fa-verify',
] as const

// Rute yang boleh diakses tanpa autentikasi tapi TIDAK redirect ke /beranda jika sudah login
// (berbeda dari AUTH_ROUTES yang redirect ke /beranda jika sudah punya token valid)
export const PUBLIC_ROUTES = [
  '/',           // splash screen
  '/onboarding', // onboarding / pilihan login-register
] as const
