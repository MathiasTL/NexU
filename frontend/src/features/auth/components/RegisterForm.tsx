import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'
import { authService } from '../services/auth.service'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage'

export const RegisterForm = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'tenant' as 'tenant' | 'host',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.register(form)
      await login(form.email, form.password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <ErrorMessage message={error} />}
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="firstName"
          name="firstName"
          label="Nombre"
          value={form.firstName}
          onChange={handleChange}
          placeholder="María"
          required
        />
        <Input
          id="lastName"
          name="lastName"
          label="Apellido"
          value={form.lastName}
          onChange={handleChange}
          placeholder="González"
          required
        />
      </div>
      <Input
        id="email"
        name="email"
        label="Correo electrónico"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="tu@email.com"
        required
        autoComplete="email"
      />
      <Input
        id="password"
        name="password"
        label="Contraseña"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Mínimo 6 caracteres"
        required
        minLength={6}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="role" className="text-sm font-medium text-gray-700">¿Cómo quieres usar Smart?</label>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={handleChange}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="tenant">Buscar propiedades (Huésped)</option>
          <option value="host">Publicar propiedades (Anfitrión)</option>
        </select>
      </div>
      <Button type="submit" loading={loading} size="lg" className="w-full">
        Crear cuenta
      </Button>
      <p className="text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
