import { useState } from 'react'
import { useAuth } from '@/core/auth/useAuth'
import { LifestylePreferencesForm } from '../components/LifestylePreferencesForm'
import type { LifestylePreferences } from '../types/account.types'

export const PreferencesPage = () => {
  const { user, setAuthUser } = useAuth()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async (prefs: LifestylePreferences) => {
    if (!user) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    setAuthUser({ ...user, lifestylePreferences: prefs })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Preferencias de convivencia</h2>
        <p className="mt-1 text-sm text-gray-500">
          Estas preferencias mejoran las recomendaciones de espacios y calculan tu compatibilidad con roommates.
        </p>
      </div>

      {saved && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          ✓ Preferencias guardadas correctamente
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <LifestylePreferencesForm
          initial={(user as { lifestylePreferences?: LifestylePreferences })?.lifestylePreferences}
          onSave={handleSave}
          loading={loading}
        />
      </div>
    </div>
  )
}
