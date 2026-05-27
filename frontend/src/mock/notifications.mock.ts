export type NotificationType = 'new_booking' | 'booking_confirmed' | 'new_review' | 'checkin_reminder'

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

export const NOTIFICATIONS_MOCK: Notification[] = [
  {
    id: 1,
    userId: 2,
    type: 'new_booking',
    title: 'Nueva solicitud de reserva',
    message: 'María González ha solicitado reservar "Penthouse con vista al mar" del 10 al 15 de julio.',
    read: false,
    createdAt: '2026-05-20T14:30:00',
  },
  {
    id: 2,
    userId: 2,
    type: 'new_review',
    title: 'Nueva reseña recibida',
    message: 'Roberto Quispe ha dejado una reseña de 5 estrellas en "Penthouse con vista al mar".',
    read: false,
    createdAt: '2026-04-05T10:15:00',
  },
  {
    id: 3,
    userId: 2,
    type: 'booking_confirmed',
    title: 'Reserva confirmada',
    message: 'Tu reserva del "Penthouse con vista al mar" ha sido confirmada. Check-in el 10 de julio.',
    read: true,
    createdAt: '2026-05-21T09:00:00',
  },
  {
    id: 4,
    userId: 2,
    type: 'checkin_reminder',
    title: 'Recordatorio de check-in',
    message: 'María González hará check-in mañana en "Penthouse con vista al mar". Asegúrate de tener todo listo.',
    read: true,
    createdAt: '2026-07-09T08:00:00',
  },
]
