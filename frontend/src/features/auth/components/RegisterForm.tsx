import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'
import { authService } from '../services/auth.service'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { PasswordInput } from '@/shared/components/ui/PasswordInput'
import { GoogleButton } from '@/shared/components/ui/GoogleButton'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'
import { cn } from '@/shared/utils/cn'

type UserRole = 'tenant' | 'host'

interface RegisterFormProps {
  role:         UserRole
  onChangeRole: () => void
}

const ROLE_BADGE: Record<UserRole, { label: string; className: string }> = {
  tenant: { label: '🎓 Estudiante',   className: 'bg-primary-100 text-primary-700' },
  host:   { label: '🏠 Propietario',  className: 'bg-secondary-100 text-secondary-700' },
}

export const RegisterForm = ({ role, onChangeRole }: RegisterFormProps) => {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [firstName,     setFirstName]     = useState('')
  const [lastName,      setLastName]      = useState('')
  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error,         setError]         = useState('')
  const [loading,       setLoading]       = useState(false)

  const badge = ROLE_BADGE[role]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptedTerms) { setError('Debes aceptar los términos y condiciones para continuar.'); return }
    setError('')
    setLoading(true)
    try {
      await authService.register({ firstName: firstName.trim(), lastName: lastName.trim(), email, password, role })
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Role badge + change */}
      <div className="flex items-center justify-between">
        <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', badge.className)}>
          {badge.label}
        </span>
        <button type="button" onClick={onChangeRole}
          className="text-xs font-medium text-gray-500 hover:text-primary hover:underline">
          Cambiar rol
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-2 gap-3">
        <Input id="firstName" label="Nombre" value={firstName}
          onChange={e => setFirstName(e.target.value)} placeholder="María" required autoComplete="given-name" />
        <Input id="lastName" label="Apellido" value={lastName}
          onChange={e => setLastName(e.target.value)} placeholder="González" required autoComplete="family-name" />
      </div>

      <Input id="reg-email" label="Correo electrónico" type="email" value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={role === 'tenant' ? 'tu@universidad.edu.pe' : 'tu@email.com'}
        required autoComplete="email" />

      <PasswordInput id="reg-password" label="Contraseña" value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Mínimo 6 caracteres" required minLength={6} showStrength autoComplete="new-password" />

      <label className="flex cursor-pointer items-start gap-2.5">
        <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500" required />
        <span className="text-xs leading-relaxed text-gray-500">
          Acepto los{' '}
          <a href="#" className="font-medium text-primary hover:underline">términos y condiciones</a>
          {' '}y la{' '}
          <a href="#" className="font-medium text-primary hover:underline">política de privacidad</a>.
        </span>
      </label>

      <Button type="submit" loading={loading} size="lg" className="w-full" disabled={!acceptedTerms}>
        Crear cuenta
      </Button>

      <div className="flex items-center gap-3">
        <hr className="flex-1 border-gray-200" />
        <span className="whitespace-nowrap text-xs text-gray-400">o continúa con</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      <GoogleButton disabled />
    </form>
  )
}
