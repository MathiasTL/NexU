import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, DollarSign } from 'lucide-react'
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
      <div className="bg-blue-600 py-20 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-3 text-4xl font-bold text-white md:text-5xl">
            Encuentra tu espacio universitario ideal
          </h1>
          <p className="mb-8 text-lg text-blue-100">
            Conectamos estudiantes con alojamientos verificados y roommates compatibles.
          </p>

          {/* CTA buttons */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/search"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
            >
              Busco alojamiento
            </Link>
            <Link
              to="/host"
              className="rounded-xl border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Quiero publicar mi espacio
            </Link>
          </div>

          {/* Segmented search bar */}
          <form
            onSubmit={handleSearch}
            className="mx-auto flex max-w-2xl items-center overflow-hidden rounded-2xl bg-white shadow-lg"
          >
            {/* Field 1: location */}
            <div className="flex flex-1 items-center gap-2 border-r border-gray-200 px-4 py-3.5">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="text"
                value={locationQuery}
                onChange={e => setLocationQuery(e.target.value)}
                placeholder="Universidad o Distrito"
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
              />
            </div>

            {/* Field 2: budget */}
            <div className="flex flex-1 items-center gap-2 px-4 py-3.5">
              <DollarSign className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="Presupuesto máx"
                min={0}
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
              />
            </div>

            {/* Search button: circle with icon */}
            <button
              type="submit"
              aria-label="Buscar"
              className="m-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

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
