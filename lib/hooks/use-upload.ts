'use client'

import { useMutation } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { uploadService } from '@/lib/services/upload.service'

export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder: string }) =>
      uploadService.uploadFile(file, folder),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengupload file'))
    },
  })
}

export function usePresignedUrl() {
  return useMutation({
    mutationFn: uploadService.getPresignedUrl,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mendapatkan URL upload'))
    },
  })
}
