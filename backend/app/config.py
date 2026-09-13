from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    PORT: int = 8000
    DATABASE_URL: str = "sqlite:///./crm.db"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    AI_API_KEY: str = ""

    @property
    def gemini_api_key(self) -> str:
        return (self.GEMINI_API_KEY or self.AI_API_KEY or "").strip()

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
