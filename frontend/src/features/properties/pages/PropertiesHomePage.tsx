import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, DollarSign, GraduationCap, Building2 } from 'lucide-react'
import { propertyService } from '../services/property.service'
import { PropertyCard } from '../components/PropertyCard'
import { LoadingSkeleton } from '@/shared/components/feedback/LoadingSkeleton'
import { useAuth } from '@/core/auth/useAuth'
import { cn } from '@/shared/utils/cn'
import type { Property } from '../types/property.types'

export const PropertiesHomePage = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [locationQuery, setLocationQuery] = useState('')
  const [budget, setBudget] = useState('')
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    propertyService.getAll().then(data => {
      setProperties(data)
      setLoading(false)
    })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (locationQuery) params.set('q', locationQuery)
    if (budget) params.set('budget', budget)
    navigate(`/search${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handlePublish = () => {
    if (isAuthenticated && (user?.role === 'host' || user?.role === 'both')) {
      navigate('/host/properties/create')
    } else {
      navigate('/register')
    }
  }

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="bg-blue-700 pb-16 pt-16">
        <div className="mx-auto max-w-3xl px-4 text-center">

          {/* Title */}
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
            Encuentra tu espacio{' '}
            <span className="text-blue-200">universitario ideal</span>
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-base leading-relaxed text-blue-100 md:text-lg">
            Conectamos estudiantes con alojamientos verificados y roommates compatibles.
          </p>

          {/* CTA buttons */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/search')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
            >
              <Search className="h-4 w-4" />
              Busco alojamiento
            </button>
            <button
              onClick={handlePublish}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-transparent px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/10 active:scale-[0.98]"
            >
              <Building2 className="h-4 w-4" />
              Quiero publicar mi espacio
            </button>
          </div>

          {/* Segmented search bar */}
          <form
            onSubmit={handleSearch}
            className="mx-auto flex max-w-2xl items-center overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/20"
          >
            {/* Field 1 */}
            <div className="flex flex-1 items-center gap-2.5 px-4 py-3.5">
              <Search className="h-4 w-4 flex-shrink-0 text-blue-500" />
              <input
                type="text"
                value={locationQuery}
                onChange={e => setLocationQuery(e.target.value)}
                placeholder="Universidad o Distrito"
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200" />

            {/* Field 2 */}
            <div className={cn('flex items-center gap-2 px-4 py-3.5', 'w-40 flex-shrink-0')}>
              <DollarSign className="h-4 w-4 flex-shrink-0 text-blue-500" />
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="Presupuesto máx."
                min={0}
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Circular search button */}
            <div className="p-2">
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 active:scale-95"
                aria-label="Buscar"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

        </div>
      </section>

      {/* ── Featured properties ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Espacios destacados en Lima
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Alojamientos verificados cerca de las principales universidades
            </p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="hidden text-sm font-medium text-blue-600 hover:underline sm:block"
          >
            Ver todos →
          </button>
        </div>

        {loading ? (
          <LoadingSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
