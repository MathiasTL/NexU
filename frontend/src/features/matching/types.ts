import type { Property } from '@/features/properties/types/property.types'
import type { AuthUser } from '@/features/auth/types/auth.types'

export interface PropertyMatch {
  property: Property
  score: number
  reasons: string[]
  dimensions: Record<string, number>
  explanation: string
}

export interface RoommateMatch {
  user: AuthUser
  score: number
  reasons: string[]
  dimensions: Record<string, number>
  explanation: string
}

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected'

export interface ConnectionRequest {
  id: number
  fromId: number
  toId: number
  status: ConnectionStatus
  createdAt: string
}
