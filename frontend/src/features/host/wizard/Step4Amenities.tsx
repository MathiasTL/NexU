import { useEffect, useState } from 'react'
import { StepHeader } from '@/shared/components/ui/StepHeader'
import { WizardNav } from './WizardNav'
import { amenityService } from '@/features/properties/services/amenity.service'
import { cn } from '@/shared/utils/cn'
import type { AmenityCategory } from '@/mock/amenities.mock'
import type { CreatePropertyDraft } from '../types/host.types'

interface StepProps {
  draft: CreatePropertyDraft
  update: (partial: Partial<CreatePropertyDraft>) => void
  onNext: () => void
  onPrev: () => void
}

export const Step4Amenities = ({ draft, update, onNext, onPrev }: StepProps) => {
  const [categories, setCategories] = useState<AmenityCategory[]>([])

  useEffect(() => {
    amenityService.getCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  const toggle = (id: string) => {
    const current = draft.amenities
    update({
      amenities: current.includes(id) ? current.filter(a => a !== id) : [...current, id]
    })
  }

  return (
    <div>
      <StepHeader current={4} total={9} title="¿Qué servicios ofreces?" subtitle="Selecciona todos los que apliquen a tu propiedad." />
      <div className="flex flex-col gap-6">
        {categories.map(cat => (
          <div key={cat.title}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{cat.title}</h3>
            <div className="grid grid-cols-2 gap-2">
              {cat.amenities.map(amenity => (
                <button
                  key={amenity.id}
                  onClick={() => toggle(amenity.id)}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-left text-sm transition-all',
                    draft.amenities.includes(amenity.id)
                      ? 'border-primary bg-primary-50 text-primary-600'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  )}
                >
                  {amenity.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <WizardNav onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
