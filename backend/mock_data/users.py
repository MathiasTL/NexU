from passlib.context import CryptContext
from app.models.user import User, LifestylePreferences

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
_HASH = _pwd.hash("password123")

USERS: list[User] = [
    User(
        id=1,
        email="ana.garcia@pucp.pe",
        hashed_password=_HASH,
        first_name="Ana",
        last_name="García",
        role="tenant",
        avatar_url="https://i.pravatar.cc/150?img=47",
        phone="+51 987 654 321",
        bio="Estudiante de Ingeniería Civil en la PUCP. Busco un lugar tranquilo cerca del campus para el ciclo 2026-2.",
        created_at="2025-03-10",
        lifestyle_preferences=LifestylePreferences(
            sleep_schedule="early",
            study_habits="intense",
            noise_level="quiet",
            cleanliness="strict",
            guests_policy="occasionally",
            smoking_policy="no",
            pets_policy="no",
            target_university="PUCP",
            max_monthly_budget=800.0,
        ),
    ),
    User(
        id=2,
        email="carlos.mendoza@gmail.com",
        hashed_password=_HASH,
        first_name="Carlos",
        last_name="Mendoza",
        role="host",
        avatar_url="https://i.pravatar.cc/150?img=12",
        phone="+51 912 345 678",
        bio="Propietario de departamentos en Miraflores y San Isidro. Llevo 5 años alquilando a estudiantes universitarios.",
        created_at="2024-11-05",
        lifestyle_preferences=None,
    ),
    User(
        id=3,
        email="lucia.torres@uni.pe",
        hashed_password=_HASH,
        first_name="Lucía",
        last_name="Torres",
        role="tenant",
        avatar_url="https://i.pravatar.cc/150?img=23",
        phone="+51 965 432 100",
        bio="Estudiante de Ingeniería Electrónica en la UNI. Me adapto bien a distintos ambientes y soy muy ordenada.",
        created_at="2025-01-20",
        lifestyle_preferences=LifestylePreferences(
            sleep_schedule="night",
            study_habits="moderate",
            noise_level="moderate",
            cleanliness="average",
            guests_policy="never",
            smoking_policy="no",
            pets_policy="yes",
            target_university="UNI",
            max_monthly_budget=600.0,
        ),
    ),
]
