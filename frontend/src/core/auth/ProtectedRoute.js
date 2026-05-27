import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { Spinner } from '@/shared/components/ui/Spinner';
export const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();
    if (isLoading) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center", children: _jsx(Spinner, {}) }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: `/login?redirect=${encodeURIComponent(location.pathname)}`, replace: true });
    }
    if (requiredRole && user) {
        const role = user.role;
        if (requiredRole === 'host' && role === 'tenant') {
            return _jsx(Navigate, { to: "/", replace: true });
        }
        if (requiredRole === 'tenant' && role === 'host') {
            return _jsx(Navigate, { to: "/host", replace: true });
        }
    }
    return _jsx(_Fragment, { children: children });
};
