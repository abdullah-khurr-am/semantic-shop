from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=100)
    brand: str = Field(default="", max_length=100)
    price: Decimal = Field(..., gt=0)
    sizes: list[str] = Field(default_factory=list)
    in_stock: bool = True
    image_url: Optional[str] = Field(default=None, max_length=512)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, min_length=1)
    category: Optional[str] = Field(default=None, min_length=1, max_length=100)
    brand: Optional[str] = Field(default=None, max_length=100)
    price: Optional[Decimal] = Field(default=None, gt=0)
    sizes: Optional[list[str]] = None
    in_stock: Optional[bool] = None
    image_url: Optional[str] = Field(default=None, max_length=512)


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    embedding_model: Optional[str] = None
    has_embedding: bool = False
    embedding_pending: bool = False
    created_at: datetime
    updated_at: datetime


class ProductListOut(BaseModel):
    items: list[ProductOut]
    total: int
    limit: int
    offset: int


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    min_price: Optional[Decimal] = Field(default=None, ge=0)
    max_price: Optional[Decimal] = Field(default=None, ge=0)
    sizes: Optional[list[str]] = None
    category: Optional[str] = Field(default=None, max_length=100)
    in_stock_only: bool = False
    limit: int = Field(default=20, ge=1, le=100)


class SearchHit(ProductOut):
    score: float = Field(..., description="Cosine similarity in [0, 1] (approx)")


class SearchResponse(BaseModel):
    query: str
    items: list[SearchHit]
    count: int


class HealthOut(BaseModel):
    status: str
    database: str
