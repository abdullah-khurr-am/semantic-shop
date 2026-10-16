from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db import get_db
from app.routers import products, search
from app.schemas import HealthOut

app = FastAPI(
    title="Semantic Shop API",
    description=(
        "Hybrid semantic product search: OpenAI embeddings + Postgres/pgvector "
        "with structured SQL filters."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(search.router)


@app.get("/health", response_model=HealthOut, tags=["health"])
def health(db: Session = Depends(get_db)) -> HealthOut:
    try:
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:  # noqa: BLE001
        db_status = "error"
    return HealthOut(
        status="ok" if db_status == "ok" else "degraded",
        database=db_status,
    )
