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
    title: 'Nueva solicitud de alquiler',
    message: 'María González ha solicitado alquilar tu habitación privada cerca de la PUCP para el ciclo 2026-2 desde agosto.',
    read: false,
    createdAt: '2026-05-20T14:30:00',
  },
  {
    id: 2,
    userId: 2,
    type: 'new_review',
    title: 'Nueva reseña recibida',
    message: 'Sofía Ramírez dejó una reseña de 5 estrellas en tu estudio cerca de ULIMA: "Excelente ubicación, muy tranquilo para estudiar".',
    read: false,
    createdAt: '2026-04-05T10:15:00',
  },
  {
    id: 3,
    userId: 2,
    type: 'booking_confirmed',
    title: 'Alquiler confirmado',
    message: 'Tu cuarto compartido cerca de la UP ha sido reservado para el ciclo 2026-2. El estudiante se muda el 1 de agosto.',
    read: true,
    createdAt: '2026-05-21T09:00:00',
  },
  {
    id: 4,
    userId: 2,
    type: 'checkin_reminder',
    title: 'Recordatorio de ingreso',
    message: 'María González llega mañana a tu habitación en San Miguel. Asegúrate de coordinar la entrega de llaves.',
    read: true,
    createdAt: '2026-07-31T08:00:00',
  },
]
