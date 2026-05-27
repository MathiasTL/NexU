import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { Button } from '@/shared/components/ui/Button';
import { formatCurrency, calcNights, formatNights } from '@/shared/utils/formatters';
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
export const PropertyBookingCard = ({ property, onBook }) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [checkin, setCheckin] = useState(today);
    const [checkout, setCheckout] = useState(tomorrow);
    const [guests, setGuests] = useState(1);
    const nights = calcNights(checkin, checkout);
    const subtotal = nights * property.pricePerNight;
    const serviceFee = Math.round(subtotal * 0.14);
    const total = subtotal + serviceFee;
    const handleReserve = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (nights < 1)
            return;
        onBook({ checkinDate: checkin, checkoutDate: checkout, guestCount: guests });
    };
    return (_jsxs("div", { className: "sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-md", children: [_jsxs("div", { className: "mb-4 flex items-baseline gap-1", children: [_jsx("span", { className: "text-2xl font-bold text-gray-900", children: formatCurrency(property.pricePerNight) }), _jsx("span", { className: "text-gray-500", children: "/ noche" })] }), _jsxs("div", { className: "mb-3 overflow-hidden rounded-xl border border-gray-200", children: [_jsxs("div", { className: "grid grid-cols-2", children: [_jsxs("div", { className: "border-r border-gray-200 p-2", children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Llegada" }), _jsx("input", { type: "date", value: checkin, min: today, onChange: e => setCheckin(e.target.value), className: "w-full text-sm font-medium text-gray-900 outline-none" })] }), _jsxs("div", { className: "p-2", children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Salida" }), _jsx("input", { type: "date", value: checkout, min: checkin, onChange: e => setCheckout(e.target.value), className: "w-full text-sm font-medium text-gray-900 outline-none" })] })] }), _jsxs("div", { className: "border-t border-gray-200 p-2", children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Hu\u00E9spedes" }), _jsx("select", { value: guests, onChange: e => setGuests(Number(e.target.value)), className: "w-full text-sm font-medium text-gray-900 outline-none", children: Array.from({ length: property.capacity }, (_, i) => i + 1).map(n => (_jsxs("option", { value: n, children: [n, " ", n === 1 ? 'huésped' : 'huéspedes'] }, n))) })] })] }), _jsx(Button, { onClick: handleReserve, size: "lg", className: "w-full", children: isAuthenticated ? 'Reservar' : 'Iniciar sesión para reservar' }), nights > 0 && (_jsxs("div", { className: "mt-4 flex flex-col gap-2 text-sm", children: [_jsxs("div", { className: "flex justify-between text-gray-600", children: [_jsxs("span", { children: [formatCurrency(property.pricePerNight), " \u00D7 ", formatNights(nights)] }), _jsx("span", { children: formatCurrency(subtotal) })] }), _jsxs("div", { className: "flex justify-between text-gray-600", children: [_jsx("span", { children: "Tarifa de servicio" }), _jsx("span", { children: formatCurrency(serviceFee) })] }), _jsx("hr", { className: "border-gray-100" }), _jsxs("div", { className: "flex justify-between font-semibold text-gray-900", children: [_jsx("span", { children: "Total" }), _jsx("span", { children: formatCurrency(total) })] })] }))] }));
};
