import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { User, Shield, Calendar, Bell, MessageSquare } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useEffect, useState } from 'react';
import { accountService } from '@/features/account/services/account.service';
import { useAuth } from '@/core/auth/useAuth';
export const AccountSidebar = () => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    useEffect(() => {
        if (!user)
            return;
        accountService.getNotifications(user.id).then(notifications => {
            setUnreadCount(notifications.filter(n => !n.read).length);
        });
    }, [user]);
    const links = [
        { to: '/account/profile', icon: User, label: 'Mi perfil' },
        { to: '/account/personal-info', icon: Shield, label: 'Info personal' },
        { to: '/account/bookings', icon: Calendar, label: 'Reservas' },
        { to: '/account/notifications', icon: Bell, label: 'Notificaciones', badge: unreadCount },
        { to: '/account/messages', icon: MessageSquare, label: 'Mensajes' },
    ];
    return (_jsx("aside", { className: "w-64 shrink-0", children: _jsx("nav", { className: "flex flex-col gap-1", children: links.map(({ to, icon: Icon, label, badge }) => (_jsxs(NavLink, { to: to, className: ({ isActive }) => cn('flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'), children: [_jsxs("span", { className: "flex items-center gap-3", children: [_jsx(Icon, { className: "h-4 w-4" }), label] }), badge !== undefined && badge > 0 && (_jsx("span", { className: "flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white", children: badge }))] }, to))) }) }));
};
