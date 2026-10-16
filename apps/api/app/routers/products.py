from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import ProductCreate, ProductListOut, ProductOut, ProductUpdate
from app import services

router = APIRouter(prefix="/products", tags=["products"])


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> ProductOut:
    product, embed_ok = services.create_product(db, payload)
    return services.product_to_out(product, embedding_pending=not embed_ok)


@router.get("", response_model=ProductListOut)
def list_products(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> ProductListOut:
    rows, total = services.list_products(db, limit=limit, offset=offset)
    return ProductListOut(
        items=[services.product_to_out(p) for p in rows],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)) -> ProductOut:
    product = services.get_product(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return services.product_to_out(product)


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: str,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
) -> ProductOut:
    product = services.get_product(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    updated, embed_ok = services.update_product(db, product, payload)
    # If text changed and embed failed, flag pending when still missing a vector
    pending = not embed_ok and updated.embedding is None
    return services.product_to_out(updated, embedding_pending=pending)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, db: Session = Depends(get_db)) -> None:
    product = services.get_product(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    services.delete_product(db, product)
