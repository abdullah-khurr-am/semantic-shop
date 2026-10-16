"""OpenAI embedding helpers for product text and search queries."""

from __future__ import annotations

from openai import OpenAI

from app.config import Settings, get_settings
from app.models import Product

TEXT_FIELDS = ("name", "description", "category", "brand")


class EmbeddingError(Exception):
    """Raised when the embedding provider call fails."""


def build_embedding_document(
    *,
    name: str,
    description: str,
    category: str,
    brand: str = "",
) -> str:
    parts = [name.strip(), category.strip()]
    if brand and brand.strip():
        parts.append(brand.strip())
    parts.append(description.strip())
    return ". ".join(p for p in parts if p)


def build_embedding_document_from_product(product: Product) -> str:
    return build_embedding_document(
        name=product.name,
        description=product.description,
        category=product.category,
        brand=product.brand or "",
    )


def get_openai_client(settings: Settings | None = None) -> OpenAI:
    settings = settings or get_settings()
    if not settings.openai_api_key or settings.openai_api_key.startswith("sk-replace"):
        raise EmbeddingError(
            "OPENAI_API_KEY is missing or still the placeholder value in .env"
        )
    return OpenAI(api_key=settings.openai_api_key)


def embed_texts(texts: list[str], settings: Settings | None = None) -> list[list[float]]:
    """Embed one or more strings; returns vectors aligned with input order."""
    if not texts:
        return []

    settings = settings or get_settings()
    client = get_openai_client(settings)

    try:
        response = client.embeddings.create(
            model=settings.openai_embedding_model,
            input=texts,
            dimensions=settings.embedding_dimensions,
        )
    except Exception as exc:  # noqa: BLE001 - surface provider errors cleanly
        raise EmbeddingError(str(exc)) from exc

    # API may not preserve order in pathological cases; sort by index
    ordered = sorted(response.data, key=lambda item: item.index)
    return [item.embedding for item in ordered]


def embed_text(text: str, settings: Settings | None = None) -> list[float]:
    vectors = embed_texts([text], settings=settings)
    return vectors[0]
