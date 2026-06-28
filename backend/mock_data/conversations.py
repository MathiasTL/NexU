from app.models.conversation import Conversation, Message

CONVERSATIONS: list[Conversation] = [
    Conversation(
        id=1,
        participants=[1, 2],
        property_id=1,
        messages=[
            Message(
                id=1,
                sender_id=1,
                text="Hola Carlos, vi tu habitación en San Miguel cerca de la PUCP. ¿Está disponible para el ciclo 2026-2 (agosto a diciembre)?",
                created_at="2026-06-10T10:15:00",
            ),
            Message(
                id=2,
                sender_id=2,
                text="¡Hola Ana! Sí, está disponible desde agosto. El precio es S/550/mes con WiFi y agua incluidos. ¿Cuántos meses necesitarías?",
                created_at="2026-06-10T10:45:00",
            ),
            Message(
                id=3,
                sender_id=1,
                text="Perfecto, necesitaría de agosto a diciembre, 5 meses. ¿El horario de silencio es estricto? Estudio hasta tarde algunos días.",
                created_at="2026-06-10T11:00:00",
            ),
            Message(
                id=4,
                sender_id=2,
                text="El silencio es a partir de las 10 pm. Con audífonos puedes estudiar más tarde. ¿Te parece si coordinas una visita para esta semana?",
                created_at="2026-06-10T11:20:00",
            ),
        ],
        last_message_at="2026-06-10T11:20:00",
    ),
    Conversation(
        id=2,
        participants=[3, 2],
        property_id=2,
        messages=[
            Message(
                id=5,
                sender_id=3,
                text="Hola, me interesa el estudio en el Rímac para el ciclo 2026-2. ¿Los servicios (agua, luz, internet) están realmente incluidos?",
                created_at="2026-06-20T09:00:00",
            ),
            Message(
                id=6,
                sender_id=2,
                text="Hola Lucía! Sí, agua, luz e internet fibra óptica están incluidos. Solo el gas y cable son aparte. El contrato mínimo es de 3 meses.",
                created_at="2026-06-20T09:30:00",
            ),
            Message(
                id=7,
                sender_id=3,
                text="Genial. ¿El contrato de alquiler es formal? Necesito presentarlo en la universidad para solicitar becas de vivienda.",
                created_at="2026-06-20T09:45:00",
            ),
            Message(
                id=8,
                sender_id=2,
                text="Claro, firmo contrato notarial. Incluye monto mensual, duración y condiciones. Puedo enviarte el modelo antes de que decidas.",
                created_at="2026-06-20T10:00:00",
            ),
        ],
        last_message_at="2026-06-20T10:00:00",
    ),
    Conversation(
        id=3,
        participants=[1, 2],
        property_id=5,
        messages=[
            Message(
                id=9,
                sender_id=1,
                text="Carlos, estoy interesada en la habitación de Miraflores cerca de la UP. ¿Aceptas el contrato desde septiembre?",
                created_at="2026-07-05T15:00:00",
            ),
            Message(
                id=10,
                sender_id=2,
                text="¡Hola Ana! Sí, puedo desde el 1 de septiembre. La habitación tiene vista al parque y el vecino también es estudiante, muy tranquilo.",
                created_at="2026-07-05T15:30:00",
            ),
        ],
        last_message_at="2026-07-05T15:30:00",
    ),
]
