import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { formatCurrency, formatNights } from '@/shared/utils/formatters';
import { calcNights } from '@/shared/utils/formatters';
const formatCard = (value) => value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
export const CheckoutModal = ({ open, onClose, property, draft, onConfirm, loading }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [message, setMessage] = useState('');
    const nights = calcNights(draft.checkinDate, draft.checkoutDate);
    const subtotal = nights * property.pricePerNight;
    const serviceFee = Math.round(subtotal * 0.14);
    const total = subtotal + serviceFee;
    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(message);
    };
    return (_jsx(Modal, { open: open, onClose: onClose, title: "Confirmar reserva", size: "lg", children: _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [_jsxs("div", { className: "rounded-xl border border-gray-100 bg-gray-50 p-3", children: [_jsx("p", { className: "font-medium text-gray-900", children: property.title }), _jsxs("p", { className: "mt-1 text-sm text-gray-500", children: [draft.checkinDate, " \u2192 ", draft.checkoutDate, " \u00B7 ", formatNights(nights), " \u00B7 ", draft.guestCount, " ", draft.guestCount === 1 ? 'huésped' : 'huéspedes'] }), _jsxs("div", { className: "mt-2 flex flex-col gap-1 text-sm", children: [_jsxs("div", { className: "flex justify-between text-gray-600", children: [_jsxs("span", { children: [formatCurrency(property.pricePerNight), " \u00D7 ", formatNights(nights)] }), _jsx("span", { children: formatCurrency(subtotal) })] }), _jsxs("div", { className: "flex justify-between text-gray-600", children: [_jsx("span", { children: "Tarifa de servicio (14%)" }), _jsx("span", { children: formatCurrency(serviceFee) })] }), _jsxs("div", { className: "flex justify-between font-bold text-gray-900", children: [_jsx("span", { children: "Total" }), _jsx("span", { children: formatCurrency(total) })] })] })] }), _jsxs("div", { children: [_jsxs("h3", { className: "mb-3 flex items-center gap-2 font-semibold text-gray-900", children: [_jsx(CreditCard, { className: "h-4 w-4" }), " Informaci\u00F3n de pago"] }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx(Input, { label: "N\u00FAmero de tarjeta", value: cardNumber, onChange: e => setCardNumber(formatCard(e.target.value)), placeholder: "1234 5678 9012 3456", required: true }), _jsx(Input, { label: "Nombre en la tarjeta", value: cardName, onChange: e => setCardName(e.target.value), placeholder: "MAR\u00CDA GONZ\u00C1LEZ", required: true }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Input, { label: "Vencimiento", value: expiry, onChange: e => setExpiry(e.target.value), placeholder: "MM/AA", maxLength: 5, required: true }), _jsx(Input, { label: "CVV", value: cvv, onChange: e => setCvv(e.target.value), placeholder: "123", maxLength: 4, required: true })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-gray-700", children: "Mensaje para el anfitri\u00F3n (opcional)" }), _jsx("textarea", { value: message, onChange: e => setMessage(e.target.value), className: "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20", rows: 2, placeholder: "Cu\u00E9ntale algo al anfitri\u00F3n..." })] }), _jsxs(Button, { type: "submit", size: "lg", loading: loading, className: "w-full", children: ["Confirmar y pagar ", formatCurrency(total)] }), _jsx("p", { className: "text-center text-xs text-gray-400", children: "Simulaci\u00F3n de pago \u2014 no se realizar\u00E1n cargos reales" })] }) }));
};
