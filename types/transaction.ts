export type OrderStatus =
  | 'WAITING_CONFIRMATION'
  | 'WAITING_PAYMENT'
  | 'PROCESSING'
  | 'IN_DELIVERY'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED'

export type OrderType = 'PHYSICAL_GOODS' | 'DIGITAL_GOODS' | 'SERVICE' | 'OTHER'
export type FeeResponsibility = 'BUYER' | 'SELLER' | 'SPLIT'
export type OrderCancelReason =
  | 'TIMEOUT_CONFIRMATION' | 'TIMEOUT_PAYMENT' | 'TIMEOUT_PROCESSING'
  | 'TIMEOUT_DELIVERY' | 'REJECTED_BY_COUNTERPART' | 'ADMIN_FORCE_CANCEL'
  | 'USER_MUTUAL_CANCEL'
export type ActorType = 'BUYER' | 'SELLER' | 'ADMIN' | 'SYSTEM'
export type UserRole = 'BUYER' | 'SELLER'
export type DeadlineExtensionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'

export interface OrderParty {
  id: string
  userId: string
  username: string | null
  fullName: string
  avatarUrl: string | null
  kycStatus: string
  averageRating: number
  totalOrdersCompleted: number
}

export interface OrderStatusHistory {
  id: string
  fromStatus: OrderStatus | null
  toStatus: OrderStatus
  changedByType: ActorType | null
  reason: string | null
  createdAt: string
}

export interface FeeBreakdown {
  orderValue: number           // IDR
  feeAmount: number            // IDR
  feeRate: number              // e.g. 0.015 = 1.5%
  feeResponsibility: FeeResponsibility
  buyerFeeAmount: number
  sellerFeeAmount: number
  buyerPayAmount: number       // Total buyer pays
  sellerReceiveAmount: number  // Total seller receives
  voucherDiscount: number
  isKahadePlus: boolean
}

export interface Order {
  id: string
  orderId: string              // ORD-YYYYMMDD-SERIAL
  title: string
  description: string
  orderType: OrderType
  status: OrderStatus
  cancelReason: OrderCancelReason | null
  cancelNote: string | null

  buyer: OrderParty
  seller: OrderParty
  createdByRole: 'BUYER' | 'SELLER'

  // Financial
  orderValue: number
  feeAmount: number
  feeRate: number
  feeResponsibility: FeeResponsibility
  buyerFeeAmount: number
  sellerFeeAmount: number
  buyerPayAmount: number
  sellerReceiveAmount: number
  voucherDiscount: number
  isKahadePlus: boolean

  // Deadlines
  deliveryDeadlineDays: number
  deliveryDeadlineAt: string | null
  paymentDeadlineAt: string | null
  confirmationDeadlineAt: string | null
  processingDeadlineAt: string | null

  // Shipping (physical goods)
  trackingNumber: string | null
  courierName: string | null
  trackingNotes: string | null

  // Timestamps
  createdAt: string
  confirmedAt: string | null
  paidAt: string | null
  processedAt: string | null
  shippedAt: string | null
  completedAt: string | null
  cancelledAt: string | null
  disputedAt: string | null
  updatedAt: string

  statusHistories: OrderStatusHistory[]
  hasDispute: boolean
  hasRating: boolean
  hasChatRoom: boolean
}

export interface OrderExtensionRequest {
  id: string
  orderId: string
  requestedByRole: UserRole
  extensionDays: number
  reason: string
  status: DeadlineExtensionStatus
  respondedAt: string | null
  rejectionNote: string | null
  createdAt: string
}
