import * as Icons from 'lucide-react'
import { AMENITY_CATEGORIES } from '@/mock/amenities.mock'
import type { Property } from '../types/property.types'

interface PropertyAmenitiesProps {
  amenities: Property['amenities']
}

type LucideIconName = keyof typeof Icons

const DynamicIcon = ({ name }: { name: string }) => {
  const IconComponent = Icons[name as LucideIconName] as React.ComponentType<{ className?: string }> | undefined
  if (!IconComponent) return <Icons.Circle className="h-4 w-4" />
  return <IconComponent className="h-4 w-4" />
}

export const PropertyAmenities = ({ amenities }: PropertyAmenitiesProps) => {
  const activeAmenities = AMENITY_CATEGORIES
    .flatMap(cat => cat.amenities.map(a => ({ ...a, category: cat.title })))
    .filter(a => amenities.includes(a.id))

  if (!activeAmenities.length) return null

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Lo que ofrece este lugar</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {activeAmenities.map(amenity => (
          <div key={amenity.id} className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5">
            <span className="text-blue-500">
              <DynamicIcon name={amenity.icon} />
            </span>
            <span className="text-sm text-gray-700">{amenity.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
