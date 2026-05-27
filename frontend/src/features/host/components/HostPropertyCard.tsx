import { Link } from 'react-router-dom'
import { Edit, Star, MapPin } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/formatters'
import type { Property } from '@/features/properties/types/property.types'

interface HostPropertyCardProps {
  property: Property
}

export const HostPropertyCard = ({ property }: HostPropertyCardProps) => (
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="relative h-40 overflow-hidden">
      <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
    <div className="p-4">
      <h3 className="mb-1 font-semibold text-gray-900 line-clamp-2">{property.title}</h3>
      <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">
        <MapPin className="h-3 w-3" />
        {property.district}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900">{formatCurrency(property.pricePerNight)}<span className="text-xs font-normal text-gray-500">/noche</span></span>
          {property.rating > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-600">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {property.rating}
            </span>
          )}
        </div>
        <Link
          to={`/properties/${property.id}`}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
        >
          <Edit className="h-3 w-3" /> Ver
        </Link>
      </div>
    </div>
  </div>
)
