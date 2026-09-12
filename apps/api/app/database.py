from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict
import psycopg

class Settings(BaseSettings):
    database_url: str
    allowed_origins: str = "http://localhost:3000"
    environment: str = "development"
    admin_password_hash: str | None = None
    session_secret: str = "dev-insecure-session-secret-change-me"
    model_config = SettingsConfigDict(env_file=".env")

    @property
    def cookie_secure(self) -> bool:
        return self.environment == "production"

    @property
    def cookie_samesite(self) -> Literal["none", "lax"]:
        return "none" if self.environment == "production" else "lax"

settings = Settings()  # pyright: ignore[reportCallIssue]

def get_connection():
    return psycopg.connect(settings.database_url)