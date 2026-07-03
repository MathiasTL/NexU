import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Home, Users, ArrowRight, MessageCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'
import { CompatibilityRadar } from './components/CompatibilityRadar'
import { matchingService, PreferencesRequiredError } from './matching.service'
import type { PropertyMatch, RoommateMatch } from './types'

type ConnectState = 'idle' | 'connecting' | 'error'

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={cn(
      'rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm',
      score >= 70 ? 'bg-green-500 text-white'
        : score >= 40 ? 'bg-primary text-white'
        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    )}>
      {score}% compatible
    </span>
  )
}

function ReasonChips({ reasons }: { reasons: string[] }) {
  if (reasons.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {reasons.map((r, i) => (
        <span key={i} className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-600 dark:bg-primary/10 dark:text-primary">
          {r}
        </span>
      ))}
    </div>
  )
}

const CARD = 'rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800'

export const MatchingPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [needsPrefs, setNeedsPrefs] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [properties, setProperties] = useState<PropertyMatch[]>([])
  const [roommates, setRoommates] = useState<RoommateMatch[]>([])
  const [connecting, setConnecting] = useState<Record<number, ConnectState>>({})

  const handleConnect = async (targetId: number) => {
    setConnecting((s) => ({ ...s, [targetId]: 'connecting' }))
    try {
      await matchingService.connectRoommate(targetId)
      navigate('/account/messages')
    } catch {
      setConnecting((s) => ({ ...s, [targetId]: 'error' }))
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      setNeedsPrefs(false)
      try {
        const [props, mates] = await Promise.all([
          matchingService.getPropertyMatches(),
          matchingService.getRoommateMatches(),
        ])
        if (cancelled) return
        setProperties(props)
        setRoommates(mates)
      } catch (err) {
        if (cancelled) return
        if (err instanceof PreferencesRequiredError) {
          setNeedsPrefs(true)
        } else {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar tus matches')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (needsPrefs) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Completa tu perfil de convivencia</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Necesitamos conocer tus hábitos y preferencias para mostrarte habitaciones y roommates compatibles.
        </p>
        <Button className="mt-6 px-8" size="lg" onClick={() => navigate('/onboarding/preferencias')}>
          Completar perfil <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Para ti</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Habitaciones y roommates ordenados por tu compatibilidad</p>
        </div>
      </div>

      {/* Habitaciones */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Habitaciones para ti</h2>
        </div>
        {properties.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Aún no hay habitaciones que analizar.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((m) => (
              <article key={m.property.id} className={CARD}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <button
                    onClick={() => navigate(`/properties/${m.property.id}`)}
                    className="text-left font-semibold text-gray-900 hover:text-primary dark:text-white"
                  >
                    {m.property.title}
                  </button>
                  <ScoreBadge score={m.score} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{m.explanation}</p>
                <ReasonChips reasons={m.reasons} />
                <div className="mt-3">
                  <CompatibilityRadar dimensions={m.dimensions} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Roommates */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Roommates compatibles</h2>
        </div>
        {roommates.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Todavía no encontramos roommates compatibles.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {roommates.map((m) => (
              <article key={m.user.id} className={CARD}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {m.user.avatarUrl && (
                      <img src={m.user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {m.user.firstName} {m.user.lastName}
                    </span>
                  </div>
                  <ScoreBadge score={m.score} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{m.explanation}</p>
                <ReasonChips reasons={m.reasons} />
                <div className="mt-3">
                  <CompatibilityRadar dimensions={m.dimensions} labelA={m.user.firstName} />
                </div>
                <Button
                  className="mt-3 w-full"
                  variant="outline"
                  size="sm"
                  loading={connecting[m.user.id] === 'connecting'}
                  onClick={() => handleConnect(m.user.id)}
                >
                  <MessageCircle className="mr-1.5 h-4 w-4" /> Contactar
                </Button>
                {connecting[m.user.id] === 'error' && (
                  <p className="mt-1 text-center text-xs text-red-500">No se pudo iniciar el contacto. Intenta de nuevo.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
