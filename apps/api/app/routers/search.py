from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.embeddings import EmbeddingError
from app.schemas import SearchRequest, SearchResponse
from app import services

router = APIRouter(tags=["search"])


@router.post("/search", response_model=SearchResponse)
def search_products(
    payload: SearchRequest,
    db: Session = Depends(get_db),
) -> SearchResponse:
    if (
        payload.min_price is not None
        and payload.max_price is not None
        and payload.min_price > payload.max_price
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="min_price cannot be greater than max_price",
        )

    try:
        hits = services.hybrid_search(db, payload)
    except EmbeddingError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Embedding provider unavailable: {exc}",
        ) from exc

    return SearchResponse(query=payload.query, items=hits, count=len(hits))
