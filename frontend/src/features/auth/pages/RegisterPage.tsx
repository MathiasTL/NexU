import { useState } from 'react'
import { RoleSelector } from '../components/RoleSelector'
import { RegisterForm } from '../components/RegisterForm'

type UserRole = 'tenant' | 'host'

export const RegisterPage = () => {
  const [role, setRole] = useState<UserRole | null>(null)

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 p-4">
      {/* Wider container when showing RoleSelector so cards go side-by-side */}
      <div className={role === null ? 'w-full max-w-lg' : 'w-full max-w-sm'}>
        <div className="mb-8 text-center">
          <img src="/Logo_NexU.png" alt="NexU" className="mx-auto mb-3 h-24 w-auto object-contain" />
          <h1 className="text-2xl font-bold text-gray-900">
            {role ? 'Crea tu cuenta' : 'Únete a NexU'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {role
              ? 'Completa tus datos para registrarte'
              : 'La plataforma de alojamiento universitario en Lima'}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {role === null
            ? <RoleSelector onSelect={setRole} />
            : <RegisterForm role={role} onChangeRole={() => setRole(null)} />
          }
        </div>
      </div>
    </div>
  )
}
