import { LoginForm } from '../components/LoginForm'

export const LoginPage = () => (
  <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="NexU" className="mx-auto mb-3 h-32 w-auto" />
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido a NexU</h1>
        <p className="mt-1 text-sm text-gray-500">Inicia sesión para continuar</p>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <LoginForm />
      </div>
    </div>
  </div>
)
