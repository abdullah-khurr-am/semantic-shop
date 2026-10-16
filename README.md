# semantic-shop

Semantic product search & discovery for e-commerce: natural-language queries hybridized with structured SQL filters (price, size, stock) via Postgres + `pgvector`.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript — `apps/web`
- **Backend:** FastAPI (Python) — `apps/api`
- **Database:** PostgreSQL 16 + `pgvector` (Docker)

## Quick start (infra + schema)

```bash
# 1. Start Postgres with pgvector
docker compose up -d   # Postgres on localhost:5434

# 2. API env + deps
cp .env.example .env
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Migrate + seed catalog (embeddings filled later by reindex / CRUD)
alembic upgrade head
python -m app.seed
```

## Interview story (short)

1. Unstructured intent (“lightweight summer jacket for rainy weather under $80”) meets structured constraints (price, size, stock).
2. Product text is embedded on create/update and stored beside relational columns.
3. Search embeds the query, applies SQL filters, then ranks by vector similarity.

See upcoming FastAPI `/search` and Next.js search UI for the full demo path.
