import type { LifestylePreferences } from '@/features/account/types/account.types'

export interface User {
  id: number
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'tenant' | 'host' | 'both'
  avatarUrl: string
  phone: string
  bio: string
  createdAt: string
  lifestylePreferences?: LifestylePreferences
}

export const USERS_MOCK: User[] = [
  {
    id: 1,
    email: 'maria@example.com',
    password: '123456',
    firstName: 'María',
    lastName: 'González',
    role: 'tenant',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    phone: '+51 987 654 321',
    bio: 'Estudiante de Derecho en la PUCP. Busco un espacio tranquilo para estudiar.',
    createdAt: '2024-02-10',
    lifestylePreferences: {
      targetUniversity: 'PUCP',
      maxMonthlyBudget: 800,
      sleepSchedule: 'early',
      studyHabits: 'intense',
      noiseLevel: 'quiet',
      cleanliness: 'strict',
      guestsPolicy: 'occasionally',
      smokingPolicy: 'no',
      petsPolicy: 'no',
    },
  },
  {
    id: 2,
    email: 'carlos@example.com',
    password: '123456',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    role: 'host',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    phone: '+51 912 345 678',
    bio: 'Propietario con 3 inmuebles en Lima. Respondo rápido y garantizo comodidad.',
    createdAt: '2023-11-05',
  },
  {
    id: 3,
    email: 'ana@example.com',
    password: '123456',
    firstName: 'Ana',
    lastName: 'Torres',
    role: 'both',
    avatarUrl: 'https://i.pravatar.cc/150?img=23',
    phone: '+51 956 789 012',
    bio: 'Diseñadora freelance. Tengo un departamento en Barranco y también busco espacios.',
    createdAt: '2024-01-20',
    lifestylePreferences: {
      targetUniversity: 'ULIMA',
      maxMonthlyBudget: 1500,
      sleepSchedule: 'night',
      studyHabits: 'moderate',
      noiseLevel: 'moderate',
      cleanliness: 'average',
      guestsPolicy: 'often',
      smokingPolicy: 'outside',
      petsPolicy: 'yes',
    },
  },
]
