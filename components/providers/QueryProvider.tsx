'use client'

import { useState, lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

let queryClientSingleton: QueryClient | null = null

export function getQueryClient(): QueryClient | null {
  return queryClientSingleton
}

const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? lazy(() =>
        import('@tanstack/react-query-devtools').then((mod) => ({
          default: mod.ReactQueryDevtools,
        }))
      )
    : null

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          gcTime: 5 * 60 * 1000,
          // FIX: Naikkan retry dari 1 → 3 dengan exponential backoff.
          // Backend kadang butuh warm-up setelah idle. Dengan retry:1, dua
          // kegagalan langsung masuk error state yang dikunci 60s.
          // Dengan retry:3 + delay bertahap → lebih toleran terhadap cold start.
          retry: 3,
          retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
          // FIX: refetchOnMount: 'always' saat query dalam error state supaya
          // saat user navigasi ke halaman yang pernah error, langsung refetch
          // tanpa perlu tunggu staleTime atau tekan "Coba Lagi" manual.
          refetchOnMount: true,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: 0,
        },
      },
    })
    queryClientSingleton = client
    return client
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  )
}
