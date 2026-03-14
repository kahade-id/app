'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage, extractData } from '@/lib/api'
import { toast } from 'sonner'
import { bankAccountService } from '@/lib/services/bank-account.service'
import { useAuthReady } from '@/lib/hooks/use-auth-ready'

export function useBankAccounts() {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => bankAccountService.list().then((res) => extractData(res).bankAccounts ?? []),
    enabled: authReady,
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
