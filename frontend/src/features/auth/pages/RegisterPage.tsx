import { useState } from 'react'
import { RoleSelector } from '../components/RoleSelector'
import { RegisterForm } from '../components/RegisterForm'

type Step = 'role' | 'form'

export const RegisterPage = () => {
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<'tenant' | 'host'>('tenant')

  const handleRoleSelect = (selectedRole: 'tenant' | 'host') => {
    setRole(selectedRole)
    setStep('form')
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
            <span className="text-xl font-bold text-white">N</span>
          </div>
          <p className="text-sm text-gray-500">Únete a la comunidad NexU</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {step === 'role' ? (
            <RoleSelector onSelect={handleRoleSelect} />
          ) : (
            <RegisterForm role={role} onChangeRole={() => setStep('role')} />
          )}
        </div>
      </div>
    </div>
  )
}
