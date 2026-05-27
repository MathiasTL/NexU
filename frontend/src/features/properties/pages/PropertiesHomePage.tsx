import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { propertyService } from '../services/property.service'
import { PropertyCard } from '../components/PropertyCard'
import { LoadingSkeleton } from '@/shared/components/feedback/LoadingSkeleton'
import type { Property } from '../types/property.types'

export const PropertiesHomePage = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    propertyService.getAll().then(data => {
      setProperties(data)
      setLoading(false)
    })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 py-20 text-center">
        <div className="relative mx-auto max-w-2xl px-4">
          <h1 className="mb-3 text-4xl font-bold text-white md:text-5xl">
            Encuentra tu espacio ideal en Perú
          </h1>
          <p className="mb-8 text-blue-100">
            Miles de propiedades únicas en Lima y todo el país
          </p>
          <form onSubmit={handleSearch} className="flex overflow-hidden rounded-2xl bg-white shadow-lg">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="¿Adónde vas? Busca por distrito..."
              className="flex-1 px-5 py-4 text-sm text-gray-900 outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 px-5 text-white hover:bg-blue-700"
            >
              <Search className="h-5 w-5" />
              <span className="hidden sm:block font-medium">Buscar</span>
            </button>
          </form>
        </div>
      </div>

      {/* Properties Grid */}
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
