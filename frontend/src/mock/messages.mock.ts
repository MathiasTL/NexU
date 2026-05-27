export interface Message {
  id: number
  senderId: number
  text: string
  createdAt: string
}

export interface Conversation {
  id: number
  participants: number[]
  propertyId: number
  messages: Message[]
  lastMessageAt: string
}

export const MESSAGES_MOCK: Conversation[] = [
  {
    id: 1,
    participants: [1, 2],
    propertyId: 1,
    messages: [
      {
        id: 1,
        senderId: 1,
        text: 'Hola Carlos! Estoy interesada en reservar el penthouse para julio. ¿Está disponible del 10 al 15?',
        createdAt: '2026-05-18T10:00:00',
      },
      {
        id: 2,
        senderId: 2,
        text: '¡Hola María! Sí, esas fechas están disponibles. El penthouse estará perfecto para ti. ¿Tienes alguna pregunta sobre las instalaciones?',
        createdAt: '2026-05-18T10:15:00',
      },
      {
        id: 3,
        senderId: 1,
        text: 'Genial! ¿Hay estacionamiento incluido? Vendremos en auto desde Callao.',
        createdAt: '2026-05-18T10:20:00',
      },
      {
        id: 4,
        senderId: 2,
        text: 'Sí, hay estacionamiento en el edificio. Ya puedes hacer la reserva con confianza.',
        createdAt: '2026-05-18T10:30:00',
      },
    ],
    lastMessageAt: '2026-05-18T10:30:00',
  },
  {
    id: 2,
    participants: [1, 3],
    propertyId: 2,
    messages: [
      {
        id: 5,
        senderId: 1,
        text: 'Hola Ana! El loft se ve increíble. ¿Permiten mascotas pequeñas? Tengo un gato.',
        createdAt: '2026-05-22T16:00:00',
      },
      {
        id: 6,
        senderId: 3,
        text: '¡Hola! Sí, los gatos son bienvenidos. El loft tiene espacios perfectos para ellos. ¿Cuándo planeas venir?',
        createdAt: '2026-05-22T16:45:00',
      },
      {
        id: 7,
        senderId: 1,
        text: 'Perfecto! Estaba pensando en la primera quincena de junio.',
        createdAt: '2026-05-22T17:00:00',
      },
    ],
    lastMessageAt: '2026-05-22T17:00:00',
  },
  {
    id: 3,
    participants: [3, 2],
    propertyId: 3,
    messages: [
      {
        id: 8,
        senderId: 3,
        text: 'Carlos, me interesa la suite ejecutiva para una conferencia que tengo la próxima semana.',
        createdAt: '2026-05-24T09:00:00',
      },
      {
        id: 9,
        senderId: 2,
        text: 'Hola Ana! Perfecto, la suite es ideal para trabajo. Tiene impresora, escritorio amplio y conexión de alta velocidad.',
        createdAt: '2026-05-24T09:30:00',
      },
    ],
    lastMessageAt: '2026-05-24T09:30:00',
  },
]
