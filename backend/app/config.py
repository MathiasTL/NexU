from __future__ import annotations
from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    secret_key: str = "dev-insecure-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True

    storage_backend: str = "memory"

    # ── LLM (Groq, API compatible con OpenAI) ─────────────────────────────────
    # Dos API keys independientes para repartir el rate limit de Groq entre los
    # dos dominios de matching:
    #   • roommates: acepta LLM_API_KEY_ROOMMATES o, por compatibilidad, los
    #     nombres antiguos LLM_API_KEY / GROQ_API_KEY.
    #   • habitaciones (rooms): LLM_API_KEY_ROOMS / GROQ_API_KEY_ROOMS.
    # Vacío en un dominio = degradación a explicación por plantilla en ese
    # dominio. Si la key de habitaciones está vacía, cae a la de roommates para
    # no regresionar configuraciones con una sola key.
    llm_api_key_roommates: str = Field(
        default="",
        validation_alias=AliasChoices("LLM_API_KEY_ROOMMATES", "LLM_API_KEY", "GROQ_API_KEY"),
    )
    llm_api_key_rooms: str = Field(
        default="",
        validation_alias=AliasChoices("LLM_API_KEY_ROOMS", "GROQ_API_KEY_ROOMS"),
    )
    llm_base_url: str = "https://api.groq.com/openai/v1"
    llm_model: str = "llama-3.1-8b-instant"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    def llm_api_key_for(self, domain: str) -> str:
        """API key del LLM para el dominio dado ('room' | 'roommate').

        Habitaciones ('room') cae a la key de roommates si no define la suya.
        """
        if domain == "room":
            return self.llm_api_key_rooms or self.llm_api_key_roommates
        return self.llm_api_key_roommates

    def llm_enabled_for(self, domain: str) -> bool:
        return bool(self.llm_api_key_for(domain))


settings = Settings()
