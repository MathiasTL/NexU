import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface PasswordInputProps {
  id?: string
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  autoComplete?: string
  showStrength?: boolean
  error?: string
}

interface StrengthInfo {
  score: number
  label: string
  color: string
  barColor: string
}

const getStrength = (password: string): StrengthInfo => {
  if (!password) return { score: 0, label: '', color: '', barColor: 'bg-gray-200' }
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Débil', color: 'text-red-500', barColor: 'bg-red-500' }
  if (score === 2) return { score, label: 'Media', color: 'text-yellow-600', barColor: 'bg-yellow-400' }
  if (score === 3) return { score, label: 'Buena', color: 'text-blue-600', barColor: 'bg-blue-500' }
  return { score, label: 'Fuerte', color: 'text-green-600', barColor: 'bg-green-500' }
}

export const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  showStrength = false,
  error,
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false)
  const strength = getStrength(value)

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={cn(
            'w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            error && 'border-red-400',
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
      {showStrength && value.length > 0 && (
        <div className="mt-1 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors duration-300',
                  i <= strength.score ? strength.barColor : 'bg-gray-200',
                )}
              />
            ))}
          </div>
          <span className={cn('min-w-[44px] text-right text-xs font-medium', strength.color)}>
            {strength.label}
          </span>
        </div>
      )}
    </div>
  )
}
