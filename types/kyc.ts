import type { KycStatus } from './auth'

export interface KycSubmitDto {
  nik: string
  ktpPhotoUrl: string
  selfiePhotoUrl: string
  ktpNumber?: string
}

export interface KycStatusResponse {
  status: KycStatus
  kycId?: string
  rejectionReason?: string
  submittedAt?: string
}
