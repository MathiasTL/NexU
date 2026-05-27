export const formatCurrency = (amount: number, _currency = 'PEN') =>
  `S/ ${amount.toLocaleString('es-PE')}`

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })

export const formatDateShort = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })

export const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export const formatNights = (n: number) => `${n} ${n === 1 ? 'noche' : 'noches'}`

export const calcNights = (checkin: string, checkout: string) => {
  const diff = new Date(checkout).getTime() - new Date(checkin).getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
