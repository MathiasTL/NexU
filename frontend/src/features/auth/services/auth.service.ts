import { USERS_MOCK } from '@/mock/users.mock'
import type { AuthUser } from '../types/auth.types'

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms))

export const authService = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    await delay()
    const user = USERS_MOCK.find(u => u.email === email && u.password === password)
    if (!user) throw new Error('Credenciales incorrectas')
    const { password: _pw, ...authUser } = user
    return authUser
  },

  register: async (data: { firstName: string; lastName: string; email: string; password: string; role: 'tenant' | 'host' }): Promise<AuthUser> => {
    await delay()
    const existing = USERS_MOCK.find(u => u.email === data.email)
    if (existing) throw new Error('El correo ya está registrado')
    const newUser = {
      id: USERS_MOCK.length + 1,
      ...data,
      avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      phone: '',
      bio: '',
      createdAt: new Date().toISOString().split('T')[0],
    }
    USERS_MOCK.push({ ...newUser, password: data.password })
    const { password: _pw, ...authUser } = newUser
    return authUser
  },
}
