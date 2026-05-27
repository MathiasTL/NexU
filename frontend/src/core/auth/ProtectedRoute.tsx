import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'
import { Spinner } from '@/shared/components/ui/Spinner'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'host' | 'tenant' | 'both'
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (requiredRole && user) {
    const role = user.role
    if (requiredRole === 'host' && role === 'tenant') {
      return <Navigate to="/" replace />
    }
    if (requiredRole === 'tenant' && role === 'host') {
      return <Navigate to="/host" replace />
    }
  }

  return <>{children}</>
}
