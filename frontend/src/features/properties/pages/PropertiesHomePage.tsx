import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Shield, Star, Users, Sparkles } from 'lucide-react'
import { propertyService } from '../services/property.service'
import { PropertyCard } from '../components/PropertyCard'
import { LoadingSkeleton } from '@/shared/components/feedback/LoadingSkeleton'
import type { Property, RoomType } from '../types/property.types'

const BENEFITS = [
  { icon: Shield, label: 'Propietarios verificados' },
  { icon: MapPin, label: 'Cerca de tu universidad' },
  { icon: Users, label: 'Compatibilidad de roommates' },
  { icon: Star, label: 'Reseñas de estudiantes' },
]

const QUICK_FILTERS: { label: string; value: RoomType | '' }[] = [
  { label: 'Todos', value: '' },
  { label: 'Habitación', value: 'room' },
  { label: 'Departamento', value: 'apartment' },
  { label: 'Compartido', value: 'shared' },
  { label: 'Estudio', value: 'studio' },
]

export const PropertiesHomePage = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<RoomType | ''>('')
  const navigate = useNavigate()

  useEffect(() => {
    propertyService.getAll().then(data => {
      setProperties(data)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(
    () => activeFilter ? properties.filter(p => p.roomType === activeFilter) : properties,
    [properties, activeFilter]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-secondary py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-700 via-secondary to-secondary-600 opacity-90" />
        <div className="relative mx-auto max-w-2xl px-4">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-300">
            <MapPin className="h-3.5 w-3.5" />
            Lima, Perú
          </div>
          <h1 className="mb-3 text-4xl font-bold leading-tight text-white md:text-5xl">
            Encuentra tu espacio ideal
            <br />
            <span className="text-primary">cerca de tu universidad</span>
          </h1>
          <p className="mb-8 text-secondary-200 md:text-lg">
            Miles de habitaciones, departamentos y estudios para universitarios en Lima
          </p>
          <form onSubmit={handleSearch} className="flex overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex flex-1 items-center gap-2 px-4">
              <Search className="h-5 w-5 shrink-0 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Busca por universidad, distrito o zona..."
                className="w-full py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:block">Buscar</span>
            </button>
          </form>

          {/* Recommendation CTA */}
          <div className="mt-4">
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-2 rounded-full border border-primary-300/50 bg-primary/20 px-5 py-2 text-sm font-medium text-primary-200 transition-colors hover:bg-primary/30"
            >
              <Sparkles className="h-4 w-4" />
              No sé dónde buscar — ayúdame a encontrar mi espacio
            </Link>
          </div>

          {/* Benefits strip */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-sm text-secondary-200">
                <Icon className="h-4 w-4 text-primary-400" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick filters */}
      <div className="border-b border-gray-100 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
          {QUICK_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === f.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Properties grid */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {activeFilter
              ? `${QUICK_FILTERS.find(f => f.value === activeFilter)?.label}s en Lima`
              : 'Espacios destacados en Lima'}
          </h2>
          <button
            onClick={() => navigate('/search')}
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todos →
          </button>
        </div>
        {loading ? (
          <LoadingSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
