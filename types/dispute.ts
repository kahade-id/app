import type { ActorType } from './transaction'

export type DisputeStatus = 'OPEN' | 'ASSIGNED' | 'UNDER_REVIEW' | 'WAITING_RESPONSE' | 'RESOLVED' | 'ESCALATED'
export type DisputeInitiator = 'BUYER' | 'SELLER' | 'BOTH'
export type DisputeDecisionType = 'FULL_BUYER' | 'FULL_SELLER' | 'SPLIT'

export interface DisputeEvidence {
  id: string
  submittedByRole: ActorType
  description: string
  fileUrls: string[]
  fileTypes: string[]
  createdAt: string
}

export interface DisputeDecision {
  id: string
  decisionType: DisputeDecisionType
  buyerAmount: number
  sellerAmount: number
  buyerPercent: number | null
  sellerPercent: number | null
  decisionNotes: string
  isExecuted: boolean
  executedAt: string | null
  createdAt: string
}

export interface Dispute {
  id: string
  disputeId: string           // DSP-YYYYMMDD-SERIAL
  orderId: string
  initiatedBy: DisputeInitiator
  buyerClaim: string | null
  sellerClaim: string | null
  buyerClaimedAt: string | null
  sellerClaimedAt: string | null
  status: DisputeStatus
  assignedAt: string | null
  escalatedAt: string | null
  resolvedAt: string | null
  slaDeadlineAt: string | null
  isSlaBreached: boolean
  evidences: DisputeEvidence[]
  decision: DisputeDecision | null
  createdAt: string
  updatedAt: string
}
