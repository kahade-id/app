// Standard API response envelope matching backend format
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T | null
  errors: { code?: string; details?: string; requestId?: string } | null
}

export interface PaginatedData<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>

// Query params
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface DateRangeParams {
  startDate?: string
  endDate?: string
}
