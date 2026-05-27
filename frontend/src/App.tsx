import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/core/auth/AuthContext'
import { router } from '@/core/router'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
