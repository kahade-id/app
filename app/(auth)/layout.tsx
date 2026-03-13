import { AuthBranding } from "@/components/auth/AuthBranding"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
        Lewati ke konten utama
      </a>
      <div className="mb-8">
        <AuthBranding />
      </div>
      <main id="main-content">
        {children}
      </main>
    </div>
  )
}
