import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar } from 'lucide-react';
import { BookingStatusBadge } from '@/features/bookings/components/BookingStatusBadge';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';
import { PROPERTIES_MOCK } from '@/mock/properties.mock';
export const ActivityFeed = ({ bookings }) => (_jsxs("div", { children: [_jsx("h3", { className: "mb-4 font-semibold text-gray-900", children: "Actividad reciente" }), bookings.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "No hay actividad reciente." })) : (_jsx("div", { className: "flex flex-col gap-3", children: bookings.map(booking => {
                const property = PROPERTIES_MOCK.find(p => p.id === booking.propertyId);
                return (_jsxs("div", { className: "flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-3", children: [_jsxs("div", { className: "flex items-start gap-3", children: [property && (_jsx("img", { src: property.images[0], alt: property.title, className: "h-12 w-14 rounded-lg object-cover" })), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900 line-clamp-1", children: property?.title ?? `Propiedad #${booking.propertyId}` }), _jsxs("p", { className: "flex items-center gap-1 text-xs text-gray-500", children: [_jsx(Calendar, { className: "h-3 w-3" }), formatDate(booking.checkinDate), " \u2192 ", formatDate(booking.checkoutDate)] })] })] }), _jsxs("div", { className: "flex shrink-0 flex-col items-end gap-1", children: [_jsx(BookingStatusBadge, { status: booking.status }), _jsx("span", { className: "text-sm font-semibold text-gray-900", children: formatCurrency(booking.totalAmount) })] })] }, booking.id));
            }) }))] }));
