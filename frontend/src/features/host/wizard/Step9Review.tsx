import { StepHeader } from '@/shared/components/ui/StepHeader'
import { Button } from '@/shared/components/ui/Button'
import { formatCurrency } from '@/shared/utils/formatters'
import { ArrowLeft } from 'lucide-react'
import type { CreatePropertyDraft } from '../types/host.types'

interface StepProps {
  draft: CreatePropertyDraft
  update: (partial: Partial<CreatePropertyDraft>) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  submitting: boolean
}

export const Step9Review = ({ draft, onPrev, onSubmit, submitting }: StepProps) => (
  <div>
    <StepHeader current={9} total={9} title="Revisa tu propiedad" subtitle="Comprueba que todo esté correcto antes de publicar." />
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <p className="text-xs text-gray-400">Tipo</p>
          <p className="font-medium capitalize text-gray-900">{draft.type || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Distrito</p>
          <p className="font-medium text-gray-900">{draft.district || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Dirección</p>
          <p className="font-medium text-gray-900">{draft.address || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Capacidad</p>
          <p className="font-medium text-gray-900">{draft.capacity} huéspedes</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Habitaciones / Camas / Baños</p>
          <p className="font-medium text-gray-900">{draft.bedrooms} / {draft.beds} / {draft.bathrooms}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Precio/noche</p>
          <p className="font-medium text-gray-900">{formatCurrency(draft.pricePerNight)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-400">Título</p>
          <p className="font-medium text-gray-900">{draft.title || '—'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-400">Servicios</p>
          <p className="font-medium text-gray-900">{draft.amenities.length > 0 ? `${draft.amenities.length} seleccionados` : 'Ninguno'}</p>
        </div>
      </div>
    </div>

    <div className="mt-8 flex justify-between">
      <Button variant="outline" onClick={onPrev}>
        <ArrowLeft className="h-4 w-4" /> Atrás
      </Button>
      <Button onClick={onSubmit} loading={submitting} size="lg">
        Publicar propiedad
      </Button>
    </div>
  </div>
)
