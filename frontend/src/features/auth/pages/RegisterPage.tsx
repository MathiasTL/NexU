import { useState } from 'react'
import { RoleSelector } from '../components/RoleSelector'
import { RegisterForm } from '../components/RegisterForm'

type UserRole = 'tenant' | 'host'

const STEP_COPY = {
  role: {
    title: '¿Cómo usarás NexU?',
    subtitle: 'Elige tu perfil para personalizar tu experiencia',
  },
  form: {
    title: 'Crea tu cuenta',
    subtitle: 'Completa tus datos para comenzar',
  },
}

export const RegisterPage = () => {
  const [role, setRole] = useState<UserRole | null>(null)
  const step = role ? 'form' : 'role'
  const copy = STEP_COPY[step]

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="NexU" className="mx-auto mb-3 h-32 w-auto" />
          <h1 className="text-2xl font-bold text-gray-900">{copy.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{copy.subtitle}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {role === null ? (
            <RoleSelector onSelect={setRole} />
          ) : (
            <RegisterForm role={role} onChangeRole={() => setRole(null)} />
          )}
        </div>
      </div>
    </div>
  )
}
