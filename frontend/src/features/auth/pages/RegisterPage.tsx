import { RegisterForm } from '../components/RegisterForm'

export const RegisterPage = () => (
  <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
          <span className="text-xl font-bold text-white">S</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-gray-500">Únete a la comunidad Smart</p>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <RegisterForm />
      </div>
    </div>
  </div>
)
