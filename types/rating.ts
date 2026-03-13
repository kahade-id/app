export type GiverRole = 'BUYER' | 'SELLER'

export interface Rating {
  id: string
  orderId: string
  giverId: string
  receiverId: string
  stars: number
  comment: string | null
  giverRole: GiverRole
  isHidden: boolean
  createdAt: string
}

export interface UserRatingSummary {
  averageRating: number
  totalCount: number
  breakdown: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}
