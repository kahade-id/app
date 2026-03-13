import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api'
import type { KycSubmitDto, KycStatusResponse } from '@/types/kyc'

export interface KycHistoryEntry {
  id: string
  status: string
  submittedAt: string
  reviewedAt: string | null
  rejectionReason: string | null
}

export const kycService = {
  submit(data: KycSubmitDto) {
    return api.post<ApiResponse<{ kycId: string }>>(API.KYC_SUBMIT, data)
  },

  getStatus() {
    return api.get<ApiResponse<KycStatusResponse>>(API.KYC_STATUS)
  },

  getHistory(params?: PaginationParams) {
    return api.get<PaginatedResponse<KycHistoryEntry>>(API.KYC_HISTORY, { params })
  },

  resubmit(data?: KycSubmitDto) {
    return api.post<ApiResponse<{ kycId: string }>>(API.KYC_RESUBMIT, data)
  },
}
