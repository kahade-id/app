'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { bankAccountService } from '@/lib/services/bank-account.service'
import { useAuthStore } from '@/lib/stores/auth.store'

export function useBankAccounts() {
  // AUTH-006 FIX: Bank account data is sensitive — added isAuthenticated guard
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => bankAccountService.list().then((res) => res.data.data?.bankAccounts ?? []),
    enabled: isAuthenticated,
  })
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bankAccountService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      toast.success('Rekening bank berhasil ditambahkan')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menambahkan rekening'))
    },
  })
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bankAccountService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      toast.success('Rekening bank berhasil dihapus')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menghapus rekening'))
    },
  })
}

export function useSetPrimaryBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bankAccountService.setPrimary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      toast.success('Rekening utama berhasil diubah')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengubah rekening utama'))
    },
  })
}
