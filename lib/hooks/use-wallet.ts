'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage, generateIdempotencyKey, extractData } from '@/lib/api'
import { toast } from 'sonner'
import { walletService, type WalletHistoryParams } from '@/lib/services/wallet.service'
import { useAuthReady } from '@/lib/hooks/use-auth-ready'
import type { PaginationParams } from '@/types/api'

function normalizeWalletTxList(res: Awaited<ReturnType<typeof walletService.getHistory>>) {
  // BUG #1 FIX: Use extractData() instead of res.data.data.
  // extractData throws if success=false or data=null, so React Query correctly
  // marks the query as errored rather than silently resolving with null.
  const d = extractData(res)
  return {
    data: d.transactions,
    total: d.total,
    page: d.page,
    limit: d.limit,
    totalPages: Math.ceil(d.total / d.limit),
    hasNext: d.page * d.limit < d.total,
    hasPrev: d.page > 1,
  }
}

export function useWallet() {
  const authReady = useAuthReady()

  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletService.get().then(extractData),
    enabled: authReady,
    staleTime: 30 * 1000,
    // H-01 FIX: No auto-retry for financial data — a failure should surface
    // immediately rather than sending duplicate requests that could cause
    // unexpected side effects or confuse the user with stale state.
    retry: false,
  })
}

export function useTopUp() {
  const queryClient = useQueryClient()
  // #002 FIX: Generate idempotency key ONCE per hook mount (useRef), not per call.
  // This ensures retries reuse the same key — backend correctly deduplicates
  // double-clicks and network-timeout retries. Key resets after success.
  const idempotencyKeyRef = React.useRef(generateIdempotencyKey())

  return useMutation({
    mutationFn: (data: { amount: number; method: string }) =>
      walletService.topUp(data, idempotencyKeyRef.current),
    // M-11 FIX: retry:false on financial mutations — idempotency key prevents
    // double-charges on genuine retries, but auto-retry on mutations is dangerous
    // because the server may have already processed the request.
    retry: false,
    onSuccess: () => {
      idempotencyKeyRef.current = generateIdempotencyKey()
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'history'] })
      toast.success('Top up berhasil diinisiasi')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal melakukan top up'))
    },
  })
}

export function useCancelTopUp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: walletService.cancelTopUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'history'] })
      toast.success('Top up berhasil dibatalkan')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal membatalkan top up'))
    },
  })
}

export function useWithdraw() {
  const queryClient = useQueryClient()
  // #002 FIX: Stable idempotency key per hook instance
  const idempotencyKeyRef = React.useRef(generateIdempotencyKey())

  return useMutation({
    mutationFn: (data: Parameters<typeof walletService.withdraw>[0]) =>
      walletService.withdraw(data, idempotencyKeyRef.current),
    // M-11 FIX: No auto-retry on withdraw — prevent potential double withdrawal
    retry: false,
    onSuccess: () => {
      idempotencyKeyRef.current = generateIdempotencyKey()
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'history'] })
      toast.success('Permintaan penarikan berhasil dikirim. Masukkan OTP.')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal melakukan penarikan'))
    },
  })
}

export function useConfirmWithdrawOtp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: walletService.confirmWithdrawOtp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'history'] })
      toast.success('Penarikan berhasil dikonfirmasi')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'OTP salah atau sudah kadaluarsa'))
    },
  })
}

// #038/#073 FIX: All wallet history hooks now require authReady
export function useWalletHistory(params?: WalletHistoryParams) {
  const authReady = useAuthReady()

  return useQuery({
    queryKey: ['wallet', 'history', params],
    queryFn: () => walletService.getHistory(params).then(normalizeWalletTxList),
    enabled: authReady,
  })
}

export function useWalletTransactionDetail(txId: string) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['wallet', 'transactions', txId],
    queryFn: () => walletService.getTransactionDetail(txId).then(extractData),
    enabled: !!txId && authReady,
  })
}

export function useTopUpHistory(params?: PaginationParams) {
  const authReady = useAuthReady()

  return useQuery({
    queryKey: ['wallet', 'topup-history', params],
    queryFn: () => walletService.getTopUpHistory(params).then(normalizeWalletTxList),
    enabled: authReady,
  })
}

export function useWithdrawHistory(params?: PaginationParams) {
  const authReady = useAuthReady()

  return useQuery({
    queryKey: ['wallet', 'withdraw-history', params],
    queryFn: () => walletService.getWithdrawHistory(params).then(normalizeWalletTxList),
    enabled: authReady,
  })
}

export function usePaymentMethods() {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['wallet', 'payment-methods'],
    queryFn: () => walletService.getPaymentMethods().then((res) => extractData(res).methods ?? []),
    enabled: authReady,
  })
}

export function useSetPin() {
  return useMutation({
    mutationFn: walletService.setPin,
    onSuccess: () => {
      toast.success('PIN berhasil diatur')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengatur PIN'))
    },
  })
}

export function useChangePin() {
  return useMutation({
    mutationFn: walletService.changePin,
    onSuccess: () => {
      toast.success('PIN berhasil diubah')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengubah PIN'))
    },
  })
}

export function useVerifyPin() {
  return useMutation({
    mutationFn: walletService.verifyPin,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'PIN salah'))
    },
  })
}
