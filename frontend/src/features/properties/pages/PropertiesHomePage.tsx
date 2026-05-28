import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, DollarSign } from 'lucide-react'
import { UniversityCombobox } from '@/shared/components/ui/UniversityCombobox'
import { propertyService } from '../services/property.service'
import { PropertyCard } from '../components/PropertyCard'
import { LoadingSkeleton } from '@/shared/components/feedback/LoadingSkeleton'
import type { Property } from '../types/property.types'

export const PropertiesHomePage = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [locationQuery, setLocationQuery] = useState('')
  const [budget, setBudget] = useState('')
  const navigate = useNavigate()

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
    if (budget) params.set('maxPrice', budget)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />

        {/* Large transparent logo watermark */}
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 w-[1100px] max-w-[170%] -translate-x-1/2 -translate-y-1/2 opacity-[0.08] [filter:brightness(0)_invert(1)]"
        />

        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center sm:py-24">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="NexU"
            className="mx-auto mb-8 h-20 w-auto drop-shadow-lg [filter:brightness(0)_invert(1)] sm:h-24"
          />

          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white drop-shadow-sm md:text-5xl">
            Encuentra tu espacio universitario ideal
          </h1>
          <p className="mb-8 text-lg text-blue-100">
            Conectamos estudiantes con alojamientos verificados y roommates compatibles.
          </p>

          {/* Segmented search bar */}
          <form
            onSubmit={handleSearch}
            className="mx-auto flex max-w-2xl items-center gap-1 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 transition focus-within:ring-2 focus-within:ring-blue-300"
          >
            {/* Field 1: university / location */}
            <UniversityCombobox
              embedded
              value={locationQuery}
              onChange={setLocationQuery}
              placeholder="Universidad o Distrito"
              className="flex-1 rounded-xl px-4 py-3 hover:bg-blue-50/40 focus-within:bg-blue-50/60"
            />

            <div className="h-8 w-px shrink-0 bg-gray-200" />

            {/* Field 2: budget */}
            <div className="flex flex-1 items-center gap-2 rounded-xl px-4 py-3 transition-colors focus-within:bg-blue-50/60">
              <DollarSign className="h-4 w-4 shrink-0 text-blue-500" />
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="Presupuesto máx"
                min={0}
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
              />
            </div>

            {/* Search button */}
            <button
              type="submit"
              aria-label="Buscar"
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:px-5"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </form>

          {/* CTA links */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/search"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
            >
              Busco alojamiento
            </Link>
            <Link
              to="/host"
              className="rounded-xl border-2 border-white/70 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Quiero publicar mi espacio
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured listings ── */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Propiedades destacadas en Lima</h2>
        {loading ? (
          <LoadingSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
