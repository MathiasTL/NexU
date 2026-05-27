import { CheckCircle, Clock } from 'lucide-react'
import type { Property } from '../types/property.types'

interface PropertyHouseRulesProps {
  property: Property
}

export const PropertyHouseRules = ({ property }: PropertyHouseRulesProps) => (
  <div>
    <h2 className="mb-4 text-xl font-semibold text-gray-900">Normas de la casa</h2>
    <div className="mb-4 flex gap-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="h-4 w-4 text-blue-500" />
        <span>Check-in: {property.checkinTime}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="h-4 w-4 text-blue-500" />
        <span>Check-out: {property.checkoutTime}</span>
      </div>
    </div>
    <ul className="flex flex-col gap-2">
      {property.houseRules.map((rule, i) => (
        <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
          {rule}
        </li>
      ))}
    </ul>
  </div>
)
