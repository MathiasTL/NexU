import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { PasswordInput } from '@/shared/components/ui/PasswordInput'
import { GoogleButton } from '@/shared/components/ui/GoogleButton'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'

export const LoginForm = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <ErrorMessage message={error} />}

      <Input
        id="email"
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
        autoComplete="email"
      />

      <PasswordInput
        id="password"
        label="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />

      <Button type="submit" loading={loading} size="lg" className="w-full">
        Iniciar sesión
      </Button>

      <p className="text-center text-sm text-gray-500">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-medium text-blue-600 hover:underline">
          Regístrate gratis
        </Link>
      </p>

      <div className="flex items-center gap-3">
        <hr className="flex-1 border-gray-200" />
        <span className="whitespace-nowrap text-xs text-gray-400">o continúa con</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      <GoogleButton />

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
        <strong>Demo:</strong> maria@example.com / 123456 (huésped) · carlos@example.com / 123456 (anfitrión)
      </div>
    </form>
  )
}
