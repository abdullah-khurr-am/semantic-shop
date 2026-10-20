from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_THIS = Path(__file__).resolve()
_API_DIR = _THIS.parents[1]  # apps/api locally, /app in Docker


def _env_files() -> tuple[str, ...]:
    files: list[str] = []
    # Monorepo checkout: .../semantic-shop/apps/api/app/config.py → parents[3] = repo root
    if len(_THIS.parents) > 3:
        repo_env = _THIS.parents[3] / ".env"
        if repo_env.is_file():
            files.append(str(repo_env))
    api_env = _API_DIR / ".env"
    if api_env.is_file():
        files.append(str(api_env))
    files.append(".env")
    return tuple(files)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_files(),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = (
        "postgresql+psycopg://semantic:semantic@localhost:5434/semantic_shop"
    )
    openai_api_key: str = ""
    openai_embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536


@lru_cache
def get_settings() -> Settings:
    return Settings()
