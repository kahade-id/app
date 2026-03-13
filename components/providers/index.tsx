"use client"

import { QueryProvider } from "./QueryProvider"
import { ThemeProvider } from "./ThemeProvider"
import { ToastProvider } from "./ToastProvider"
import { AuthProvider } from "./AuthProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <ToastProvider />
      </ThemeProvider>
    </QueryProvider>
  )
}
