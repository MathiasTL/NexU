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
        text: 'Hola Carlos! Vi tu habitación cerca de la PUCP y me interesa mucho. ¿Está disponible para el ciclo 2026-2 que empieza en agosto?',
        createdAt: '2026-05-18T10:00:00',
      },
      {
        id: 2,
        senderId: 2,
        text: '¡Hola María! Sí, está disponible desde el 1 de agosto. ¿Estudias en la PUCP? La habitación queda a unos 8 minutos caminando.',
        createdAt: '2026-05-18T10:15:00',
      },
      {
        id: 3,
        senderId: 1,
        text: 'Perfecto, sí soy de la PUCP. ¿El alquiler mensual incluye agua, luz e internet? ¿Y cuáles son las reglas de convivencia?',
        createdAt: '2026-05-18T10:20:00',
      },
      {
        id: 4,
        senderId: 2,
        text: 'Incluye agua e internet de 100 Mbps. La luz se divide entre los inquilinos. Las reglas son básicas: silencio después de las 11 pm y limpieza de áreas comunes por turnos. Si quieres, coordina una visita para que veas el cuarto.',
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
        text: 'Hola Ana! Me interesa el cuarto compartido cerca de la UP. ¿Cuántos estudiantes viven ahí actualmente?',
        createdAt: '2026-05-22T16:00:00',
      },
      {
        id: 6,
        senderId: 3,
        text: '¡Hola María! Somos tres en total, todas chicas y estudiantes de la UP. Hay dos habitaciones compartidas y una sala de estudio. ¿Desde cuándo lo necesitas?',
        createdAt: '2026-05-22T16:45:00',
      },
      {
        id: 7,
        senderId: 1,
        text: 'Desde inicio de agosto para el ciclo 2026-2. ¿Se permiten visitas de familia los fines de semana? Y también, ¿hay gas incluido o usamos balón?',
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
        text: 'Carlos, vi tu estudio cerca de ULIMA y me parece ideal. ¿Podrías contarme más sobre el contrato? ¿Es mensual o por semestre?',
        createdAt: '2026-05-24T09:00:00',
      },
      {
        id: 9,
        senderId: 2,
        text: 'Hola Ana! El contrato es mensual con renovación automática. No hay penalidad si avisas con 30 días de anticipación. El estudio es ideal para estudiar sola: tiene escritorio amplio, wifi de 200 Mbps y cocina equipada. ¿Quieres coordinar una visita esta semana?',
        createdAt: '2026-05-24T09:30:00',
      },
    ],
    lastMessageAt: '2026-05-24T09:30:00',
  },
]
