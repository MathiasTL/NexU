import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuth } from '@/core/auth/useAuth';
import { hostService } from '../services/host.service';
import { DashboardStats } from '../components/DashboardStats';
import { ActivityFeed } from '../components/ActivityFeed';
import { Spinner } from '@/shared/components/ui/Spinner';
export const HostDashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!user)
            return;
        Promise.all([
            hostService.getDashboardStats(user.id),
            hostService.getRecentActivity(user.id),
        ]).then(([s, a]) => {
            setStats(s);
            setActivity(a);
            setLoading(false);
        });
    }, [user]);
    if (loading)
        return (_jsx("div", { className: "flex justify-center py-20", children: _jsx(Spinner, {}) }));
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Dashboard" }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Bienvenido, ", user?.firstName, ". Aqu\u00ED tienes un resumen de tu actividad."] })] }), stats && _jsx(DashboardStats, { stats: stats }), _jsx("div", { className: "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm", children: _jsx(ActivityFeed, { bookings: activity }) })] }));
};
