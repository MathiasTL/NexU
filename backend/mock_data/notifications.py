from app.models.notification import Notification

NOTIFICATIONS: list[Notification] = [
    Notification(
        id=1,
        user_id=2,
        type="new_booking",
        title="Nueva solicitud de alquiler",
        message="Ana García quiere alquilar tu habitación en San Miguel por 6 meses a partir de marzo 2026, cerca de la PUCP.",
        read=False,
        created_at="2026-02-10T09:30:00",
    ),
    Notification(
        id=2,
        user_id=1,
        type="booking_confirmed",
        title="¡Alquiler confirmado!",
        message="Carlos Mendoza aceptó tu solicitud para la habitación en San Miguel. Tu contrato inicia en marzo 2026.",
        read=True,
        created_at="2026-02-11T14:00:00",
    ),
    Notification(
        id=3,
        user_id=2,
        type="new_review",
        title="Nueva reseña de tu propiedad",
        message="Lucía Torres dejó una reseña de 4 estrellas en tu estudio del Rímac: 'Buen estudio independiente cerca de la UNI.'",
        read=False,
        created_at="2026-05-20T18:45:00",
    ),
    Notification(
        id=4,
        user_id=3,
        type="checkin_reminder",
        title="Recordatorio de entrega de llaves",
        message="Tu contrato del estudio en Rímac comienza el 1 de agosto. Coordina la entrega de llaves con Carlos Mendoza.",
        read=False,
        created_at="2026-07-25T10:00:00",
    ),
]
