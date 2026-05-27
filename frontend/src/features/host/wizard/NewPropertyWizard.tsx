import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'
import { propertyService } from '@/features/properties/services/property.service'
import { Step1PropertyType } from './Step1PropertyType'
import { Step2Location } from './Step2Location'
import { Step3Capacity } from './Step3Capacity'
import { Step4Amenities } from './Step4Amenities'
import { Step5Photos } from './Step5Photos'
import { Step6Title } from './Step6Title'
import { Step7Description } from './Step7Description'
import { Step8Price } from './Step8Price'
import { Step9Review } from './Step9Review'
import type { CreatePropertyDraft, WizardStep } from '../types/host.types'

const INITIAL_DRAFT: CreatePropertyDraft = {
  type: '',
  location: '',
  district: '',
  address: '',
  capacity: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenities: [],
  title: '',
  description: '',
  pricePerNight: 100,
}

export const NewPropertyWizard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<WizardStep>(1)
  const [draft, setDraft] = useState<CreatePropertyDraft>(INITIAL_DRAFT)
  const [submitting, setSubmitting] = useState(false)

  const update = (partial: Partial<CreatePropertyDraft>) =>
    setDraft(prev => ({ ...prev, ...partial }))

  const next = () => setStep(s => Math.min(s + 1, 9) as WizardStep)
  const prev = () => setStep(s => Math.max(s - 1, 1) as WizardStep)

  const handleSubmit = async () => {
    if (!user) return
    setSubmitting(true)
    await propertyService.create({
      ...draft,
      hostId: user.id,
      shortDescription: draft.description.slice(0, 100),
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format',
      ],
    })
    navigate('/host/properties')
  }

  const stepProps = { draft, update, onNext: next, onPrev: prev }

  return (
    <div className="mx-auto max-w-2xl">
      {step === 1 && <Step1PropertyType {...stepProps} />}
      {step === 2 && <Step2Location {...stepProps} />}
      {step === 3 && <Step3Capacity {...stepProps} />}
      {step === 4 && <Step4Amenities {...stepProps} />}
      {step === 5 && <Step5Photos {...stepProps} />}
      {step === 6 && <Step6Title {...stepProps} />}
      {step === 7 && <Step7Description {...stepProps} />}
      {step === 8 && <Step8Price {...stepProps} />}
      {step === 9 && <Step9Review {...stepProps} onSubmit={handleSubmit} submitting={submitting} />}
    </div>
  )
}
