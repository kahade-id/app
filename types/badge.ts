export interface Badge {
  id: string
  name: string
  iconUrl: string
  description: string
  createdAt: string
}

export interface UserBadge {
  id: string
  badgeId: string
  badge: Badge
  earnedAt: string
}
