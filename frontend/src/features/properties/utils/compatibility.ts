import type { Property } from '../types/property.types'
import type { LifestylePreferences } from '@/features/account/types/account.types'

interface CompatibilityResult {
  score: number
  reasons: string[]
}

export function calcCompatibility(
  prefs: LifestylePreferences,
  property: Property,
): CompatibilityResult {
  let score = 0
  const reasons: string[] = []
  const amenities = property.amenities

  // University proximity (25 pts)
  if (prefs.targetUniversity && property.nearestUniversity === prefs.targetUniversity) {
    score += 25
    reasons.push(`Cerca de ${prefs.targetUniversity}`)
  } else if (property.distanceToUniversityMinutes <= 10) {
    score += 10
  }

  // Budget (25 pts)
  if (prefs.maxMonthlyBudget > 0 && property.pricePerMonth <= prefs.maxMonthlyBudget) {
    const margin = (prefs.maxMonthlyBudget - property.pricePerMonth) / prefs.maxMonthlyBudget
    score += Math.round(25 * Math.min(1, margin + 0.5))
    reasons.push('Dentro de tu presupuesto')
  }

  // Noise level (15 pts)
  if (prefs.noiseLevel === 'quiet' && amenities.includes('QUIET_HOURS')) {
    score += 15
    reasons.push('Horario de silencio incluido')
  } else if (prefs.noiseLevel === 'lively' && !amenities.includes('QUIET_HOURS')) {
    score += 10
  } else if (prefs.noiseLevel === 'moderate') {
    score += 8
  }

  // Study habits (15 pts)
  if (prefs.studyHabits === 'intense' && amenities.includes('WORKSPACE')) {
    score += 15
    reasons.push('Escritorio de estudio disponible')
  } else if (prefs.studyHabits !== '') {
    score += 5
  }

  // Pets (10 pts)
  if (prefs.petsPolicy === 'yes' && amenities.includes('PETS_ALLOWED')) {
    score += 10
    reasons.push('Mascotas permitidas')
  } else if (prefs.petsPolicy === 'no' && !amenities.includes('PETS_ALLOWED')) {
    score += 10
  }

  // Smoking (10 pts)
  const noSmoke = property.houseRules.some(r => r.toLowerCase().includes('fumar'))
  if (prefs.smokingPolicy === 'no' && noSmoke) {
    score += 10
    reasons.push('Espacio sin humo')
  } else if (prefs.smokingPolicy !== 'no') {
    score += 5
  }

  return { score: Math.min(100, score), reasons }
}

export function hasPreferences(prefs: LifestylePreferences | null | undefined): boolean {
  if (!prefs) return false
  return !!(prefs.sleepSchedule || prefs.studyHabits || prefs.noiseLevel || prefs.targetUniversity)
}
