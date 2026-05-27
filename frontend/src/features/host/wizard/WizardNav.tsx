import { Button } from '@/shared/components/ui/Button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface WizardNavProps {
  onPrev: () => void
  onNext: () => void
  isFirst?: boolean
  isLast?: boolean
  canNext?: boolean
  nextLabel?: string
  loading?: boolean
}

export const WizardNav = ({ onPrev, onNext, isFirst, canNext = true, nextLabel = 'Siguiente', loading }: WizardNavProps) => (
  <div className="mt-8 flex justify-between">
    <Button variant="outline" onClick={onPrev} disabled={isFirst}>
      <ArrowLeft className="h-4 w-4" /> Atrás
    </Button>
    <Button onClick={onNext} disabled={!canNext} loading={loading}>
      {nextLabel} <ArrowRight className="h-4 w-4" />
    </Button>
  </div>
)
