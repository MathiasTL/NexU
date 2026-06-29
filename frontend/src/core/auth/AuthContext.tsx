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

const USER_CACHE_KEY = 'nextu_user'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hidratación: si hay token, validarlo contra /auth/me y restaurar sesión
  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    authService.me()
      .then(authUser => {
        setUser(authUser)
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(authUser))
      })
      .catch(() => {
        clearTokens()
        localStorage.removeItem(USER_CACHE_KEY)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const authUser = await authService.login(email, password)
    setUser(authUser)
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(authUser))
    return authUser
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(USER_CACHE_KEY)
    authService.logout()
  }, [])

  const setAuthUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser)
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updatedUser))
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  )
}
