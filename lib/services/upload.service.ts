import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse } from '@/types/api'

export interface PresignedUrlResponse {
  uploadUrl: string
  fileUrl: string
  fileKey: string
  expiresAt: string
}

export const uploadService = {
  getPresignedUrl(data: { fileName: string; fileType: string; folder: string }) {
    return api.post<ApiResponse<PresignedUrlResponse>>(API.UPLOAD_PRESIGNED_URL, data)
  },

  confirm(data: { fileKey: string }) {
    return api.post<ApiResponse<{ fileUrl: string }>>(API.UPLOAD_CONFIRM, data)
  },

  async uploadFile(file: File, folder: string): Promise<string> {
    const { data: presigned } = await uploadService.getPresignedUrl({
      fileName: file.name,
      fileType: file.type,
      folder,
    })

    if (!presigned.data) {
      throw new Error('Gagal mendapatkan URL upload')
    }

    const { uploadUrl, fileKey } = presigned.data

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })

    // SEC-004 FIX: Check response.ok before confirming — if the S3 upload fails
    // (network error, expired presigned URL, permission denied) we must NOT call
    // confirm(), otherwise we acknowledge a file that was never uploaded.
    if (!uploadResponse.ok) {
      throw new Error(`Upload ke S3 gagal: ${uploadResponse.status} ${uploadResponse.statusText}`)
    }

    const { data: confirmed } = await uploadService.confirm({ fileKey })

    if (!confirmed.data) {
      throw new Error('Gagal mengkonfirmasi upload')
    }

    return confirmed.data.fileUrl
  },
}
