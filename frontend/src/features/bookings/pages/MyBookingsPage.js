import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '@/core/auth/useAuth';
import { bookingService } from '../services/booking.service';
import { BookingCard } from '../components/BookingCard';
import { BookingDetailModal } from '../components/BookingDetailModal';
import { Spinner } from '@/shared/components/ui/Spinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
const TABS = [
    { key: 'all', label: 'Todas' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'completed', label: 'Completadas' },
    { key: 'cancelled', label: 'Canceladas' },
];
export const MyBookingsPage = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selected, setSelected] = useState(null);
    useEffect(() => {
        if (!user)
            return;
        bookingService.getByTenantId(user.id).then(data => {
            setBookings(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
            setLoading(false);
        });
    }, [user]);
    const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);
    if (loading)
        return (_jsx("div", { className: "flex justify-center py-20", children: _jsx(Spinner, {}) }));
    return (_jsxs("div", { children: [_jsx("h2", { className: "mb-6 text-xl font-bold text-gray-900", children: "Mis reservas" }), _jsx("div", { className: "mb-6 flex gap-2 overflow-x-auto pb-1", children: TABS.map(tab => (_jsx("button", { onClick: () => setActiveTab(tab.key), className: `shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.key
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`, children: tab.label }, tab.key))) }), filtered.length === 0 ? (_jsx(EmptyState, { icon: _jsx(Calendar, { className: "h-12 w-12" }), title: "No hay reservas aqu\u00ED", description: "Tus reservas aparecer\u00E1n en esta secci\u00F3n." })) : (_jsx("div", { className: "flex flex-col gap-3", children: filtered.map(booking => (_jsx(BookingCard, { booking: booking, onSelect: setSelected }, booking.id))) })), _jsx(BookingDetailModal, { booking: selected, open: !!selected, onClose: () => setSelected(null) })] }));
};
