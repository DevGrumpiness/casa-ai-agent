from pydantic_settings import BaseSettings, SettingsConfigDict
import psycopg

class Settings(BaseSettings):
    database_url: str
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()  # pyright: ignore[reportCallIssue]

def get_connection():
    return psycopg.connect(settings.database_url)