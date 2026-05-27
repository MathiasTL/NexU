import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GraduationCap, Building2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/core/auth/useAuth'
import { authService } from '../services/auth.service'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { PasswordInput } from '@/shared/components/ui/PasswordInput'
import { GoogleButton } from '@/shared/components/ui/GoogleButton'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { cn } from '@/shared/utils/cn'

interface RegisterFormProps {
  role: 'tenant' | 'host'
  onChangeRole: () => void
}

export const RegisterForm = ({ role, onChangeRole }: RegisterFormProps) => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptedTerms) {
      setError('Debes aceptar los términos y condiciones para continuar')
      return
    }
    setError('')
    setLoading(true)
    try {
      const parts = fullName.trim().split(' ')
      const firstName = parts[0] ?? fullName
      const lastName = parts.slice(1).join(' ') || firstName
      await authService.register({ firstName, lastName, email, password, role })
      await login(email, password)
      navigate(role === 'host' ? '/host/dashboard' : '/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  const RoleIcon = role === 'tenant' ? GraduationCap : Building2
  const roleLabel = role === 'tenant' ? 'Estudiante' : 'Propietario'

  return (
    <div className="flex flex-col gap-5">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            role === 'tenant'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-emerald-100 text-emerald-700',
          )}
        >
          <RoleIcon className="h-3.5 w-3.5" />
          {roleLabel}
        </span>
        <button
          type="button"
          onClick={onChangeRole}
          className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="h-3 w-3" />
          Cambiar rol
        </button>
      </div>

      <h2 className="text-xl font-bold text-gray-900">Crea tu cuenta</h2>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="fullName"
          label="Nombre completo"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Juan Pérez"
          required
          autoComplete="name"
        />
        <Input
          id="reg-email"
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="juan@universidad.edu.pe"
          required
          autoComplete="email"
        />
        <PasswordInput
          id="reg-password"
          label="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
          autoComplete="new-password"
          showStrength
        />

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={e => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-blue-600"
          />
          <span className="text-xs leading-relaxed text-gray-600">
            Acepto los{' '}
            <Link to="#" className="font-medium text-blue-600 hover:underline">
              términos y condiciones
            </Link>{' '}
            y la{' '}
            <Link to="#" className="font-medium text-blue-600 hover:underline">
              política de privacidad
            </Link>
          </span>
        </label>

        <Button type="submit" loading={loading} size="lg" className="w-full">
          Crear cuenta
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400">o continúa con</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <GoogleButton />
      </form>
    </div>
  )
}
