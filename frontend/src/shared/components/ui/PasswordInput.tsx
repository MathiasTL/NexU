import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { InputHTMLAttributes } from 'react'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  showStrength?: boolean
}

function getStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score as 0 | 1 | 2 | 3 | 4
}

const STRENGTH_CONFIG = [
  { label: '', bar: 'bg-transparent', text: '' },
  { label: 'Débil', bar: 'bg-red-400', text: 'text-red-500' },
  { label: 'Regular', bar: 'bg-yellow-400', text: 'text-yellow-600' },
  { label: 'Buena', bar: 'bg-blue-500', text: 'text-blue-600' },
  { label: 'Fuerte', bar: 'bg-green-500', text: 'text-green-600' },
] as const

const WIDTH_CLASSES = ['w-0', 'w-1/4', 'w-2/4', 'w-3/4', 'w-full']

export const PasswordInput = ({
  label,
  error,
  showStrength = false,
  className,
  id,
  value = '',
  ...props
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false)
  const strength = showStrength ? getStrength(String(value)) : 0
  const config = STRENGTH_CONFIG[strength]

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
          className={cn(
            'w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50',
            error && 'border-red-400',
            className,
          )}
          {...props}
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

      {showStrength && String(value).length > 0 && (
        <div className="mt-1 space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                config.bar,
                WIDTH_CLASSES[strength],
              )}
            />
          </div>
          <p className={cn('text-xs font-medium', config.text)}>{config.label}</p>
        </div>
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
