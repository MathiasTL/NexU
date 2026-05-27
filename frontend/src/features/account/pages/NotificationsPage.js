import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '@/core/auth/useAuth';
import { accountService } from '../services/account.service';
import { Spinner } from '@/shared/components/ui/Spinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { Button } from '@/shared/components/ui/Button';
import { formatDateTime } from '@/shared/utils/formatters';
import { cn } from '@/shared/utils/cn';
export const NotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!user)
            return;
        accountService.getNotifications(user.id).then(data => {
            setNotifications(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
            setLoading(false);
        });
    }, [user]);
    const markRead = async (id) => {
        await accountService.markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };
    const markAllRead = async () => {
        const unread = notifications.filter(n => !n.read);
        await Promise.all(unread.map(n => accountService.markNotificationRead(n.id)));
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };
    if (loading)
        return _jsx("div", { className: "flex justify-center py-20", children: _jsx(Spinner, {}) });
    const unreadCount = notifications.filter(n => !n.read).length;
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-6 flex items-center justify-between", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900", children: ["Notificaciones ", unreadCount > 0 && _jsx("span", { className: "ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-sm text-blue-700", children: unreadCount })] }), unreadCount > 0 && (_jsxs(Button, { variant: "ghost", size: "sm", onClick: markAllRead, children: [_jsx(CheckCheck, { className: "h-4 w-4" }), " Marcar todas como le\u00EDdas"] }))] }), notifications.length === 0 ? (_jsx(EmptyState, { icon: _jsx(Bell, { className: "h-12 w-12" }), title: "Sin notificaciones", description: "Tus notificaciones aparecer\u00E1n aqu\u00ED." })) : (_jsx("div", { className: "flex flex-col gap-2", children: notifications.map(n => (_jsx("div", { onClick: () => !n.read && markRead(n.id), className: cn('cursor-pointer rounded-2xl border p-4 transition-colors', n.read ? 'border-gray-100 bg-white' : 'border-blue-100 bg-blue-50'), children: _jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: cn('font-medium', n.read ? 'text-gray-700' : 'text-blue-900'), children: n.title }), _jsx("p", { className: "mt-0.5 text-sm text-gray-500", children: n.message }), _jsx("p", { className: "mt-1 text-xs text-gray-400", children: formatDateTime(n.createdAt) })] }), !n.read && (_jsx("div", { className: "mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" }))] }) }, n.id))) }))] }));
};
