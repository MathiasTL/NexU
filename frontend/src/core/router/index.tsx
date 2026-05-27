import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/shared/components/layout/MainLayout'
import { AccountLayout } from '@/shared/components/layout/AccountLayout'
import { HostLayout } from '@/shared/components/layout/HostLayout'
import { ProtectedRoute } from '@/core/auth/ProtectedRoute'

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'

// Property pages
import { PropertiesHomePage } from '@/features/properties/pages/PropertiesHomePage'
import { SearchPage } from '@/features/properties/pages/SearchPage'
import { PropertyDetailPage } from '@/features/properties/pages/PropertyDetailPage'

// Booking pages
import { MyBookingsPage } from '@/features/bookings/pages/MyBookingsPage'

// Account pages
import { ProfilePage } from '@/features/account/pages/ProfilePage'
import { PersonalInfoPage } from '@/features/account/pages/PersonalInfoPage'
import { NotificationsPage } from '@/features/account/pages/NotificationsPage'
import { MessagesPage } from '@/features/account/pages/MessagesPage'

// Host pages
import { HostDashboardPage } from '@/features/host/pages/HostDashboardPage'
import { HostPropertiesPage } from '@/features/host/pages/HostPropertiesPage'
import { HostReservationsPage } from '@/features/host/pages/HostReservationsPage'
import { HostReviewsPage } from '@/features/reviews/pages/HostReviewsPage'
import { NewPropertyWizard } from '@/features/host/wizard/NewPropertyWizard'

const NotFoundPage = () => (
  <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
    <h1 className="text-4xl font-bold text-gray-900">404</h1>
    <p className="text-gray-500">Página no encontrada</p>
    <a href="/" className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Volver al inicio</a>
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <PropertiesHomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'properties/:id', element: <PropertyDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'account',
        element: (
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <ProfilePage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'personal-info', element: <PersonalInfoPage /> },
          { path: 'bookings', element: <MyBookingsPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'messages', element: <MessagesPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/host',
    element: (
      <ProtectedRoute requiredRole="host">
        <HostLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HostDashboardPage /> },
      { path: 'properties', element: <HostPropertiesPage /> },
      { path: 'reservations', element: <HostReservationsPage /> },
      { path: 'reviews', element: <HostReviewsPage /> },
      { path: 'new-property', element: <NewPropertyWizard /> },
    ],
  },
])
