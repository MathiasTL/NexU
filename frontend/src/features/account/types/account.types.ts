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
