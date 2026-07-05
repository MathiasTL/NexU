import { createContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authService } from '@/features/auth/services/auth.service'
import { getAccessToken, clearTokens } from '@/core/http/client'
import type { AuthUser } from '@/features/auth/types/auth.types'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
  setAuthUser: (user: AuthUser) => void
}

export const AuthContext = createContext<AuthState | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hidratación: si hay token, validarlo contra /auth/me y restaurar sesión.
  // /auth/me es la única fuente de verdad del usuario (incluye preferencias).
  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    authService.me()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const authUser = await authService.login(email, password)
    setUser(authUser)
    return authUser
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    authService.logout()
  }, [])

  const setAuthUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  )
}
