export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'tenant' | 'host'
}

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'tenant' | 'host' | 'both'
  avatarUrl: string
  phone: string
  bio: string
  createdAt: string
}
