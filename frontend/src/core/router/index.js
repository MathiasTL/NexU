import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { AccountLayout } from '@/shared/components/layout/AccountLayout';
import { HostLayout } from '@/shared/components/layout/HostLayout';
import { ProtectedRoute } from '@/core/auth/ProtectedRoute';
// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
// Property pages
import { PropertiesHomePage } from '@/features/properties/pages/PropertiesHomePage';
import { SearchPage } from '@/features/properties/pages/SearchPage';
import { PropertyDetailPage } from '@/features/properties/pages/PropertyDetailPage';
// Booking pages
import { MyBookingsPage } from '@/features/bookings/pages/MyBookingsPage';
// Account pages
import { ProfilePage } from '@/features/account/pages/ProfilePage';
import { PersonalInfoPage } from '@/features/account/pages/PersonalInfoPage';
import { NotificationsPage } from '@/features/account/pages/NotificationsPage';
import { MessagesPage } from '@/features/account/pages/MessagesPage';
// Host pages
import { HostDashboardPage } from '@/features/host/pages/HostDashboardPage';
import { HostPropertiesPage } from '@/features/host/pages/HostPropertiesPage';
import { HostReservationsPage } from '@/features/host/pages/HostReservationsPage';
import { HostReviewsPage } from '@/features/reviews/pages/HostReviewsPage';
import { NewPropertyWizard } from '@/features/host/wizard/NewPropertyWizard';
const NotFoundPage = () => (_jsxs("div", { className: "flex min-h-[400px] flex-col items-center justify-center gap-4", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900", children: "404" }), _jsx("p", { className: "text-gray-500", children: "P\u00E1gina no encontrada" }), _jsx("a", { href: "/", className: "rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700", children: "Volver al inicio" })] }));
export const router = createBrowserRouter([
    {
        path: '/',
        element: _jsx(MainLayout, {}),
        children: [
            { index: true, element: _jsx(PropertiesHomePage, {}) },
            { path: 'search', element: _jsx(SearchPage, {}) },
            { path: 'properties/:id', element: _jsx(PropertyDetailPage, {}) },
            { path: 'login', element: _jsx(LoginPage, {}) },
            { path: 'register', element: _jsx(RegisterPage, {}) },
            {
                path: 'account',
                element: (_jsx(ProtectedRoute, { children: _jsx(AccountLayout, {}) })),
                children: [
                    { index: true, element: _jsx(ProfilePage, {}) },
                    { path: 'profile', element: _jsx(ProfilePage, {}) },
                    { path: 'personal-info', element: _jsx(PersonalInfoPage, {}) },
                    { path: 'bookings', element: _jsx(MyBookingsPage, {}) },
                    { path: 'notifications', element: _jsx(NotificationsPage, {}) },
                    { path: 'messages', element: _jsx(MessagesPage, {}) },
                ],
            },
            { path: '*', element: _jsx(NotFoundPage, {}) },
        ],
    },
    {
        path: '/host',
        element: (_jsx(ProtectedRoute, { requiredRole: "host", children: _jsx(HostLayout, {}) })),
        children: [
            { index: true, element: _jsx(HostDashboardPage, {}) },
            { path: 'properties', element: _jsx(HostPropertiesPage, {}) },
            { path: 'reservations', element: _jsx(HostReservationsPage, {}) },
            { path: 'reviews', element: _jsx(HostReviewsPage, {}) },
            { path: 'new-property', element: _jsx(NewPropertyWizard, {}) },
        ],
    },
]);
