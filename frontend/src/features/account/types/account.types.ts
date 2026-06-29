export interface LifestylePreferences {
  sleepSchedule:    'early' | 'night' | ''
  studyHabits:      'light' | 'moderate' | 'intense' | ''
  noiseLevel:       'quiet' | 'moderate' | 'lively' | ''
  cleanliness:      'relaxed' | 'average' | 'strict' | ''
  guestsPolicy:     'never' | 'occasionally' | 'often' | ''
  smokingPolicy:    'no' | 'outside' | ''
  petsPolicy:       'no' | 'yes' | ''
  targetUniversity: string
  maxMonthlyBudget: number
}

export const DEFAULT_LIFESTYLE: LifestylePreferences = {
  sleepSchedule: '', studyHabits: '', noiseLevel: '', cleanliness: '',
  guestsPolicy: '', smokingPolicy: '', petsPolicy: '',
  targetUniversity: '', maxMonthlyBudget: 0,
}

export interface ProfileUpdatePayload {
  firstName: string
  lastName: string
  phone: string
  bio: string
}

export interface PersonalInfoPayload {
  email: string
  phone: string
}

export type NotificationType = 'new_booking' | 'booking_confirmed' | 'new_review' | 'checkin_reminder'

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface Message {
  id: number
  senderId: number
  text: string
  createdAt: string
}

export interface ParticipantInfo {
  id: number
  firstName: string
  lastName: string
  avatarUrl: string
}

export interface Conversation {
  id: number
  participants: number[]
  participantsInfo: ParticipantInfo[]
  propertyId: number
  propertyTitle: string | null
  messages: Message[]
  lastMessageAt: string
}

export interface PublicUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  avatarUrl: string
  phone: string
  bio: string
  createdAt: string
}
