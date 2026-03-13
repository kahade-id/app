import { api, withIdempotencyKey } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse, PaginationParams } from '@/types/api'
import type { Order, OrderExtensionRequest, FeeBreakdown, OrderStatus, OrderType } from '@/types/transaction'

interface OrderListData {
  orders: Order[]
  total: number
  page: number
  limit: number
}

export interface OrderListParams extends PaginationParams {
  status?: OrderStatus
  role?: 'BUYER' | 'SELLER'
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateOrderData {
  title: string
  description: string
  orderType: OrderType
  orderValue: number
  deliveryDeadlineDays: number
  counterpartUsername: string
  role: 'BUYER' | 'SELLER'
  feeResponsibility: 'BUYER' | 'SELLER' | 'SPLIT'
  voucherCode?: string
}

export interface OrderSummary {
  totalOrders: number
  activeOrders: number
  completedOrders: number
  cancelledOrders: number
  disputedOrders: number
  totalValue: number
}

export interface OrderHistoryEntry {
  id: string
  action: string
  description: string
  performedBy: string
  createdAt: string
}

export const transactionService = {
  list(params?: OrderListParams) {
    return api.get<ApiResponse<OrderListData>>(API.ORDERS_LIST, { params })
  },

  create(data: CreateOrderData, idempotencyKey?: string) {
    return api.post<ApiResponse<Order>>(API.ORDERS_CREATE, data, {
      headers: withIdempotencyKey(idempotencyKey),
    })
  },

  getSummary() {
    return api.get<ApiResponse<OrderSummary>>(API.ORDERS_SUMMARY)
  },

  validateCounterpart(data: { username: string }) {
    return api.post<ApiResponse<{ valid: boolean; userId?: string; fullName?: string }>>(API.ORDERS_VALIDATE_COUNTERPART, data)
  },

  getDetail(id: string) {
    return api.get<ApiResponse<Order>>(API.ORDERS_DETAIL(id))
  },

  confirm(id: string) {
    return api.post<ApiResponse<Order>>(API.ORDERS_CONFIRM(id))
  },

  reject(id: string, data?: { reason?: string }) {
    return api.post<ApiResponse<Order>>(API.ORDERS_REJECT(id), data)
  },

  pay(id: string, data: { paymentMethod: string; pin?: string }, idempotencyKey?: string) {
    return api.post<ApiResponse<Order>>(API.ORDERS_PAY(id), data, {
      headers: withIdempotencyKey(idempotencyKey),
    })
  },

  markProcessing(id: string) {
    return api.post<ApiResponse<Order>>(API.ORDERS_MARK_PROCESSING(id))
  },

  process(id: string) {
    return api.post<ApiResponse<Order>>(API.ORDERS_PROCESS(id))
  },

  ship(id: string, data: { trackingNumber: string; courierName: string; trackingNotes?: string }) {
    return api.post<ApiResponse<Order>>(API.ORDERS_SHIP(id), data)
  },

  updateShipping(id: string, data: { trackingNumber?: string; courierName?: string; trackingNotes?: string }) {
    return api.put<ApiResponse<Order>>(API.ORDERS_SHIPPING_UPDATE(id), data)
  },

  complete(id: string) {
    return api.post<ApiResponse<Order>>(API.ORDERS_COMPLETE(id))
  },

  cancel(id: string, data?: { reason?: string }) {
    return api.post<ApiResponse<Order>>(API.ORDERS_CANCEL(id), data)
  },

  getHistory(id: string) {
    return api.get<ApiResponse<OrderHistoryEntry[]>>(API.ORDERS_HISTORY(id))
  },

  getExtensions(id: string) {
    return api.get<ApiResponse<OrderExtensionRequest[]>>(API.ORDERS_EXTENSIONS(id))
  },

  requestExtension(id: string, data: { extensionDays: number; reason: string }) {
    return api.post<ApiResponse<OrderExtensionRequest>>(API.ORDERS_EXTENSIONS(id), data)
  },

  respondExtension(id: string, extId: string, data: { action: 'APPROVE' | 'REJECT'; note?: string }) {
    return api.put<ApiResponse<OrderExtensionRequest>>(API.ORDERS_EXTENSION_RESPOND(id, extId), data)
  },

  calculateFee(data: { orderValue: number; feeResponsibility: string; voucherCode?: string }) {
    return api.post<ApiResponse<FeeBreakdown>>(API.ORDERS_CALCULATE_FEE, data)
  },
}
