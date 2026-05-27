import { useState } from 'react'
import { GraduationCap, Building2, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'

type UserRole = 'tenant' | 'host'

interface RoleSelectorProps {
  onSelect: (role: UserRole) => void
}

interface RoleCard {
  role: UserRole
  icon: React.ElementType
  title: string
  description: string
}

const ROLES: RoleCard[] = [
  {
    role: 'tenant',
    icon: GraduationCap,
    title: 'Soy estudiante',
    description: 'Busco habitación, departamento o roommates cerca de mi universidad.',
  },
  {
    role: 'host',
    icon: Building2,
    title: 'Soy propietario',
    description: 'Quiero publicar mi espacio y encontrar inquilinos confiables.',
  },
]

export const RoleSelector = ({ onSelect }: RoleSelectorProps) => {
  const [selected, setSelected] = useState<UserRole | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ROLES.map(({ role, icon: Icon, title, description }) => {
          const isSelected = selected === role
          return (
            <button
              key={role}
              type="button"
              onClick={() => setSelected(role)}
              className={cn(
                'relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all duration-150',
                isSelected
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50',
              )}
            >
              {isSelected && (
                <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-blue-600" />
              )}
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl transition-colors',
                  isSelected ? 'bg-blue-600' : 'bg-gray-100',
                )}
              >
                <Icon
                  className={cn('h-7 w-7', isSelected ? 'text-white' : 'text-gray-500')}
                />
              </div>
              <div>
                <p className={cn('font-semibold', isSelected ? 'text-blue-700' : 'text-gray-900')}>
                  {title}
                </p>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              </div>
            </button>
          )
        })}
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
      >
        Continuar →
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
