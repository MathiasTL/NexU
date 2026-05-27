import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuth } from '@/core/auth/useAuth';
import { bookingService } from '@/features/bookings/services/booking.service';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { ReservationDetailPanel } from '../components/ReservationDetailPanel';
import { Spinner } from '@/shared/components/ui/Spinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { Calendar } from 'lucide-react';
const FILTERS = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'completed', label: 'Completadas' },
    { key: 'cancelled', label: 'Canceladas' },
];
export const HostReservationsPage = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    useEffect(() => {
        if (!user)
            return;
        bookingService.getByHostId(user.id).then(data => {
            setBookings(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
            setLoading(false);
        });
    }, [user]);
    const handleUpdateStatus = async (id, status) => {
        await bookingService.updateStatus(id, status);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        if (selected?.id === id)
            setSelected(prev => prev ? { ...prev, status } : null);
    };
    const filtered = activeFilter === 'all' ? bookings : bookings.filter(b => b.status === activeFilter);
    if (loading)
        return _jsx("div", { className: "flex justify-center py-20", children: _jsx(Spinner, {}) });
    return (_jsxs("div", { className: "flex gap-6", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h2", { className: "mb-4 text-xl font-bold text-gray-900", children: "Reservas" }), _jsx("div", { className: "mb-4 flex gap-2 overflow-x-auto pb-1", children: FILTERS.map(f => (_jsx("button", { onClick: () => setActiveFilter(f.key), className: `shrink-0 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${activeFilter === f.key
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`, children: f.label }, f.key))) }), filtered.length === 0 ? (_jsx(EmptyState, { icon: _jsx(Calendar, { className: "h-12 w-12" }), title: "Sin reservas", description: "Las reservas de tus propiedades aparecer\u00E1n aqu\u00ED." })) : (_jsx("div", { className: "flex flex-col gap-3", children: filtered.map(booking => (_jsx(BookingCard, { booking: booking, onSelect: b => setSelected(b) }, booking.id))) }))] }), selected && (_jsx("div", { className: "w-80 shrink-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm", children: _jsx(ReservationDetailPanel, { booking: selected, onClose: () => setSelected(null), onUpdateStatus: handleUpdateStatus }) }))] }));
};
