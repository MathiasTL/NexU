import { apiRequest } from '@/core/http/client'
import type { Conversation } from '@/features/account/types/account.types'
import type { PropertyMatch, RoommateMatch } from './types'

/**
 * Error lanzado cuando el estudiante aún no completó su perfil de convivencia
 * (el backend responde 409). La página lo usa para mostrar el CTA de onboarding.
 */
export class PreferencesRequiredError extends Error {
  constructor(message = 'Completa tu perfil de convivencia para ver matches') {
    super(message)
    this.name = 'PreferencesRequiredError'
  }
}

async function fetchMatches<T>(path: string): Promise<T[]> {
  try {
    return await apiRequest<T[]>(path)
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.toLowerCase().includes('completa tu perfil')) {
      throw new PreferencesRequiredError(message)
    }
    throw err
  }
}

export const matchingService = {
  getPropertyMatches: (): Promise<PropertyMatch[]> =>
    fetchMatches<PropertyMatch>('/matching/properties'),

  getRoommateMatches: (): Promise<RoommateMatch[]> =>
    fetchMatches<RoommateMatch>('/matching/roommates'),

  connectRoommate: (targetId: number): Promise<Conversation> =>
    apiRequest<Conversation>(`/matching/roommates/${targetId}/connect`, { method: 'POST' }),
}
