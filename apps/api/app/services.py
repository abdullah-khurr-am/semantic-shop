"""Product CRUD + hybrid search orchestration."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.embeddings import (
    TEXT_FIELDS,
    EmbeddingError,
    build_embedding_document_from_product,
    embed_text,
)
from app.models import Product
from app.schemas import ProductCreate, ProductOut, ProductUpdate, SearchHit, SearchRequest


def product_to_out(
    product: Product,
    *,
    embedding_pending: bool = False,
    score: float | None = None,
) -> ProductOut | SearchHit:
    has_embedding = product.embedding is not None
    pending = embedding_pending or not has_embedding
    base = {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "category": product.category,
        "brand": product.brand,
        "price": product.price,
        "sizes": list(product.sizes or []),
        "in_stock": product.in_stock,
        "image_url": product.image_url,
        "embedding_model": product.embedding_model,
        "has_embedding": has_embedding,
        "embedding_pending": pending,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
    }
    if score is not None:
        return SearchHit(**base, score=score)
    return ProductOut(**base)


def _apply_embedding(product: Product) -> None:
    settings = get_settings()
    vector = embed_text(build_embedding_document_from_product(product), settings=settings)
    product.embedding = vector
    product.embedding_model = settings.openai_embedding_model


def create_product(db: Session, payload: ProductCreate) -> tuple[Product, bool]:
    """Create product and attempt embed-on-write. Returns (product, embed_ok)."""
    product = Product(
        name=payload.name,
        description=payload.description,
        category=payload.category,
        brand=payload.brand,
        price=payload.price,
        sizes=payload.sizes,
        in_stock=payload.in_stock,
        image_url=payload.image_url,
    )
    db.add(product)
    db.flush()

    embed_ok = True
    try:
        _apply_embedding(product)
    except EmbeddingError:
        embed_ok = False
        product.embedding = None
        product.embedding_model = None

    db.commit()
    db.refresh(product)
    return product, embed_ok


def get_product(db: Session, product_id: str) -> Product | None:
    return db.get(Product, product_id)


def list_products(
    db: Session, *, limit: int = 50, offset: int = 0
) -> tuple[list[Product], int]:
    total = db.scalar(select(func.count()).select_from(Product)) or 0
    rows = db.scalars(
        select(Product).order_by(Product.created_at.desc()).limit(limit).offset(offset)
    ).all()
    return list(rows), int(total)


def update_product(
    db: Session, product: Product, payload: ProductUpdate
) -> tuple[Product, bool]:
    data = payload.model_dump(exclude_unset=True)
    text_changed = any(field in data for field in TEXT_FIELDS)

    for key, value in data.items():
        setattr(product, key, value)

    embed_ok = True
    if text_changed:
        try:
            _apply_embedding(product)
        except EmbeddingError:
            embed_ok = False
            # Keep prior embedding if present; only clear when none existed
            if product.embedding is None:
                product.embedding_model = None

    db.commit()
    db.refresh(product)
    return product, embed_ok


def delete_product(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()


def hybrid_search(db: Session, request: SearchRequest) -> list[SearchHit]:
    query_vector = embed_text(request.query.strip())
    distance = Product.embedding.cosine_distance(query_vector)
    similarity = (1 - distance).label("score")

    stmt = select(Product, similarity).where(Product.embedding.is_not(None))

    if request.min_price is not None:
        stmt = stmt.where(Product.price >= request.min_price)
    if request.max_price is not None:
        stmt = stmt.where(Product.price <= request.max_price)
    if request.category:
        stmt = stmt.where(func.lower(Product.category) == request.category.lower())
    if request.in_stock_only:
        stmt = stmt.where(Product.in_stock.is_(True))
    if request.sizes:
        stmt = stmt.where(Product.sizes.overlap(request.sizes))

    stmt = stmt.order_by(distance).limit(request.limit)
    rows = db.execute(stmt).all()

    hits: list[SearchHit] = []
    for product, score in rows:
        # Clamp floating noise into a readable [0, 1] band
        clamped = max(0.0, min(1.0, float(score)))
        hits.append(product_to_out(product, score=clamped))  # type: ignore[arg-type]
    return hits


def reindex_products(
    db: Session,
    *,
    only_missing: bool = False,
    batch_size: int = 32,
) -> dict[str, int]:
    """Bulk (re)embed products. Returns counts for interview/demo CLI."""
    settings = get_settings()
    stmt = select(Product).order_by(Product.created_at.asc())
    if only_missing:
        stmt = stmt.where(Product.embedding.is_(None))

    products = list(db.scalars(stmt).all())
    succeeded = 0
    failed = 0

    from app.embeddings import embed_texts

    for start in range(0, len(products), batch_size):
        chunk = products[start : start + batch_size]
        docs = [build_embedding_document_from_product(p) for p in chunk]
        try:
            vectors = embed_texts(docs, settings=settings)
        except EmbeddingError:
            failed += len(chunk)
            continue

        for product, vector in zip(chunk, vectors, strict=True):
            product.embedding = vector
            product.embedding_model = settings.openai_embedding_model
            succeeded += 1
        db.commit()

    return {
        "total": len(products),
        "succeeded": succeeded,
        "failed": failed,
    }
