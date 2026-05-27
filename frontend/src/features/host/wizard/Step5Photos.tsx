import { Camera } from 'lucide-react'
import { StepHeader } from '@/shared/components/ui/StepHeader'
import { WizardNav } from './WizardNav'
import type { CreatePropertyDraft } from '../types/host.types'

interface StepProps {
  draft: CreatePropertyDraft
  update: (partial: Partial<CreatePropertyDraft>) => void
  onNext: () => void
  onPrev: () => void
}

export const Step5Photos = ({ onNext, onPrev }: StepProps) => (
  <div>
    <StepHeader current={5} total={9} title="Añade fotos de tu propiedad" subtitle="Las fotos son clave para atraer huéspedes." />
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 py-16">
      <div className="rounded-full bg-gray-100 p-4">
        <Camera className="h-8 w-8 text-gray-400" />
      </div>
      <div className="text-center">
        <p className="font-medium text-gray-900">Sube tus fotos aquí</p>
        <p className="mt-1 text-sm text-gray-500">En esta versión demo, se asignará una imagen automáticamente</p>
      </div>
    </div>
    <WizardNav onPrev={onPrev} onNext={onNext} nextLabel="Continuar sin fotos" />
  </div>
)
