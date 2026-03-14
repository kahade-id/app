'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { getApiErrorMessage, generateIdempotencyKey, extractData } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { transactionService, type OrderListParams, type CreateOrderData } from '@/lib/services/transaction.service'
import { useAuthReady } from '@/lib/hooks/use-auth-ready'
import { ROUTES } from '@/lib/constants'
import type { Order } from '@/types/transaction'

// Centralised query-key factory
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params?: OrderListParams) => [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  extensions: (id: string) => [...transactionKeys.detail(id), 'extensions'] as const,
  history: (id: string) => [...transactionKeys.detail(id), 'history'] as const,
  summary: () => [...transactionKeys.all, 'summary'] as const,
}

interface TransactionListResult {
  data: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// M-10 FIX: Removed stray closing brace that was left from a deleted function,
// causing a TypeScript compile error (unexpected } outside any block).

// #17 FIX: Buat alias useRecentTransactions agar dashboard tidak langsung pakai useTransactions
// dengan limit hardcode. Jika backend nantinya menambahkan endpoint GET /orders/recent
// yang lebih optimal (sorted by updatedAt, tanpa pagination overhead), cukup ganti
// implementasi hook ini tanpa mengubah semua consumer di dashboard.
export function useRecentTransactions(limit = 5) {
  return useTransactions({ page: 1, limit })
}

export function useTransactions(params?: OrderListParams): UseQueryResult<TransactionListResult> {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () =>
      transactionService.list(params).then((res) => {
        // BUG #1 FIX: extractData throws on success=false or data=null.
        // Previously `if (!d) return null` silently resolved with null causing
        // "Gagal Memuat" error state with no retry.
        const d = extractData(res)
        return {
          data: d.orders,
          total: d.total,
          page: d.page,
          limit: d.limit,
          totalPages: Math.ceil(d.total / d.limit),
          hasNext: d.page * d.limit < d.total,
          hasPrev: d.page > 1,
        }
      }),
    enabled: authReady,
    staleTime: 30 * 1000,
  })
}

export function useTransactionDetail(id: string) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionService.getDetail(id).then(extractData),
    enabled: !!id && authReady,
    staleTime: 15 * 1000,
    // H-01 FIX: No auto-retry for transaction detail — surface failures immediately
    retry: false,
  })
}

// #017 FIX: Added enabled: authReady guard
export function useOrderSummary() {
  const authReady = useAuthReady()

  return useQuery({
    queryKey: transactionKeys.summary(),
    queryFn: () => transactionService.getSummary().then(extractData),
    enabled: authReady,
    staleTime: 60 * 1000,
  })
}

export function useValidateCounterpart() {
  return useMutation({
    mutationFn: transactionService.validateCounterpart,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal memvalidasi pengguna'))
    },
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  const router = useRouter()
  // #002/#056 FIX: Stable idempotency key per mount — not generated inside mutationFn
  const idempotencyKeyRef = React.useRef(generateIdempotencyKey())

  return useMutation({
    mutationFn: (data: CreateOrderData) =>
      transactionService.create(data, idempotencyKeyRef.current),
    onSuccess: ({ data: res }) => {
      idempotencyKeyRef.current = generateIdempotencyKey()
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      toast.success('Transaksi berhasil dibuat!')
      if (res.data) {
        router.push(ROUTES.TRANSACTION_DETAIL(res.data.id))
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal membuat transaksi'))
    },
  })
}

export function useConfirmTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transactionService.confirm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
      toast.success('Transaksi berhasil dikonfirmasi')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengkonfirmasi transaksi'))
    },
  })
}

export function useRejectTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { reason?: string } }) =>
      transactionService.reject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
      // ADD-002 FIX: Invalidate wallet so escrow refund shows immediately
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      toast.success('Transaksi berhasil ditolak')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menolak transaksi'))
    },
  })
}

// #056 FIX: Stable idempotency key per mount for payment
export function usePayTransaction() {
  const queryClient = useQueryClient()
  const idempotencyKeyRef = React.useRef(generateIdempotencyKey())

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { paymentMethod: string; pin?: string } }) =>
      transactionService.pay(id, data, idempotencyKeyRef.current),
    onSuccess: (_, { id }) => {
      idempotencyKeyRef.current = generateIdempotencyKey()
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      toast.success('Pembayaran berhasil!')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal melakukan pembayaran'))
    },
  })
}

export function useMarkProcessing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transactionService.markProcessing(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
      toast.success('Status diubah ke Diproses')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengubah status'))
    },
  })
}

export function useShipTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { trackingNumber: string; courierName: string; trackingNotes?: string } }) =>
      transactionService.ship(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
      toast.success('Pengiriman berhasil dikonfirmasi')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengkonfirmasi pengiriman'))
    },
  })
}

// #067 FIX: Added JSDoc warning — callers MUST use ConfirmDialog before invoking this.
// Releasing escrow funds is irreversible; a confirmation step is required at the UI level.
/**
 * Complete a transaction and release escrow funds to the seller.
 * ⚠️ IRREVERSIBLE — always wrap the trigger in a <ConfirmDialog> with a clear
 * message about the consequences of releasing funds before calling mutate().
 */
export function useCompleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transactionService.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      toast.success('Transaksi selesai! Dana telah dilepas.')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menyelesaikan transaksi'))
    },
  })
}

export function useCancelTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { reason?: string } }) =>
      transactionService.cancel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      toast.success('Transaksi berhasil dibatalkan')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal membatalkan transaksi'))
    },
  })
}

export function useRequestExtension() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { extensionDays: number; reason: string } }) =>
      transactionService.requestExtension(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: transactionKeys.extensions(id) })
      toast.success('Permintaan perpanjangan telah dikirim')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengirim permintaan perpanjangan'))
    },
  })
}

export function useRespondExtension() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, extId, data }: { id: string; extId: string; data: { action: 'APPROVE' | 'REJECT'; note?: string } }) =>
      transactionService.respondExtension(id, extId, data),
    onSuccess: (_res, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: transactionKeys.extensions(id) })
      toast.success(data.action === 'APPROVE' ? 'Perpanjangan disetujui' : 'Perpanjangan ditolak')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal merespon perpanjangan'))
    },
  })
}

export function useCalculateFee() {
  return useMutation({
    mutationFn: transactionService.calculateFee,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menghitung biaya'))
    },
  })
}

export function useProcessTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transactionService.process(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
      toast.success('Transaksi mulai diproses')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal memproses transaksi'))
    },
  })
}

export function useUpdateShipping() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { trackingNumber?: string; courierName?: string; trackingNotes?: string } }) =>
      transactionService.updateShipping(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
      toast.success('Info pengiriman berhasil diperbarui')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal memperbarui info pengiriman'))
    },
  })
}

export function useOrderHistory(id: string) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: transactionKeys.history(id),
    queryFn: () => transactionService.getHistory(id).then(extractData),
    enabled: !!id && authReady,
  })
}

export function useOrderExtensions(id: string) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: transactionKeys.extensions(id),
    queryFn: () => transactionService.getExtensions(id).then(extractData),
    enabled: !!id && authReady,
  })
}
