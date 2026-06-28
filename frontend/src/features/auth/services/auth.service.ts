import { apiRequest, setTokens, clearTokens } from '@/core/http/client'
import type { AuthUser } from '../types/auth.types'

interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    const data = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setTokens(data.accessToken, data.refreshToken)
    return data.user
  },

  register: async (payload: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: 'tenant' | 'host'
  }): Promise<AuthUser> => {
    const data = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    setTokens(data.accessToken, data.refreshToken)
    return data.user
  },

  logout: (): void => {
    clearTokens()
  },
}
