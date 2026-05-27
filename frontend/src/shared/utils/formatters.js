export const formatCurrency = (amount, _currency = 'PEN') => `S/ ${amount.toLocaleString('es-PE')}`;
export const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
export const formatDateShort = (dateStr) => new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
export const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
export const formatNights = (n) => `${n} ${n === 1 ? 'noche' : 'noches'}`;
export const calcNights = (checkin, checkout) => {
    const diff = new Date(checkout).getTime() - new Date(checkin).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
