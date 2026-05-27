import { Star, MapPin, Users, BedDouble, Bath } from 'lucide-react'
import type { Property } from '../types/property.types'

interface PropertyBasicInfoProps {
  property: Property
}

export const PropertyBasicInfo = ({ property }: PropertyBasicInfoProps) => (
  <div>
    <h1 className="mb-2 text-2xl font-bold text-gray-900">{property.title}</h1>
    <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
      <span className="flex items-center gap-1">
        <MapPin className="h-4 w-4" />
        {property.district}, {property.city}
      </span>
      {property.rating > 0 && (
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <strong className="text-gray-900">{property.rating}</strong>
          <span className="text-gray-400">({property.reviewsCount} reseñas)</span>
        </span>
      )}
    </div>
    <div className="flex flex-wrap gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-gray-700">
        <Users className="h-4 w-4 text-blue-500" />
        {property.capacity} huéspedes
      </span>
      <span className="flex items-center gap-2 text-sm text-gray-700">
        <BedDouble className="h-4 w-4 text-blue-500" />
        {property.bedrooms} habitaciones · {property.beds} camas
      </span>
      <span className="flex items-center gap-2 text-sm text-gray-700">
        <Bath className="h-4 w-4 text-blue-500" />
        {property.bathrooms} baños
      </span>
    </div>
    <p className="mt-4 leading-relaxed text-gray-600">{property.description}</p>
  </div>
)
