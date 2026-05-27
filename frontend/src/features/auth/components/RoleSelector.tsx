import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Building2, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'

type UserRole = 'tenant' | 'host'

interface RoleSelectorProps {
  onSelect: (role: UserRole) => void
}

const ROLES = [
  {
    value: 'tenant' as UserRole,
    icon: GraduationCap,
    title: 'Soy estudiante',
    description: 'Busco habitación, departamento o roommates cerca de mi universidad.',
    accent: 'blue',
  },
  {
    value: 'host' as UserRole,
    icon: Building2,
    title: 'Soy propietario',
    description: 'Quiero publicar mi espacio y encontrar inquilinos confiables.',
    accent: 'emerald',
  },
]

export const RoleSelector = ({ onSelect }: RoleSelectorProps) => {
  const [selected, setSelected] = useState<UserRole | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">¿Cómo usarás NexU?</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Elige tu perfil para personalizar tu experiencia
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ROLES.map(({ value, icon: Icon, title, description }) => {
          const isSelected = selected === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              className={cn(
                'relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all duration-200',
                isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-600/10'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md',
              )}
            >
              {isSelected && (
                <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-blue-600" />
              )}
              <div
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-200',
                  isSelected ? 'bg-blue-600' : 'bg-gray-100',
                )}
              >
                <Icon
                  className={cn('h-8 w-8', isSelected ? 'text-white' : 'text-gray-500')}
                />
              </div>
              <div>
                <p
                  className={cn(
                    'text-base font-semibold',
                    isSelected ? 'text-blue-900' : 'text-gray-900',
                  )}
                >
                  {title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
              </div>
            </button>
          )
        })}
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={selected === null}
        onClick={() => selected !== null && onSelect(selected)}
      >
        Continuar
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
