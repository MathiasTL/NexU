import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'
import { accountService } from '@/features/account/services/account.service'
import { LifestylePreferencesForm } from '@/features/account/components/LifestylePreferencesForm'
import type { LifestylePreferences } from '@/features/account/types/account.types'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'

export const OnboardingPreferencesPage = () => {
  const { user, setAuthUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (prefs: LifestylePreferences) => {
    if (!user) return
    setError('')
    setLoading(true)
    try {
      const updatedUser = await accountService.updatePreferences(user.id, prefs)
      setAuthUser(updatedUser)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar tus preferencias')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <img src="/Logo_NexU.png" alt="NexU" className="mx-auto mb-3 h-24 w-auto object-contain" />
          <h1 className="text-2xl font-bold text-gray-900">Cuéntanos cómo vives</h1>
          <p className="mt-1 text-sm text-gray-500">
            Con esto podemos recomendarte espacios y roommates compatibles contigo.
          </p>
        </div>

        {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <LifestylePreferencesForm
            initial={user?.lifestylePreferences}
            onSave={handleSave}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
