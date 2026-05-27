import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useAuth } from '@/core/auth/useAuth'
import { propertyService } from '@/features/properties/services/property.service'
import { HostPropertyCard } from '../components/HostPropertyCard'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type { Property } from '@/features/properties/types/property.types'

export const HostPropertiesPage = () => {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return
    propertyService.getByHostId(user.id).then(data => {
      setProperties(data)
      setLoading(false)
    })
  }, [user])

  const filtered = properties.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.district.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Mis propiedades</h2>
        <Link to="/host/new-property">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Nueva propiedad
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar propiedades..."
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No tienes propiedades publicadas"
          description="Publica tu primera propiedad y empieza a recibir huéspedes."
          action={
            <Link to="/host/new-property">
              <Button><Plus className="h-4 w-4" /> Publicar propiedad</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <HostPropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  )
}
