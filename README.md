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

# 4. Put a real OPENAI_API_KEY in repo-root .env, then embed + run API
python -m app.reindex --only-missing
uvicorn app.main:app --reload --port 8000
```

OpenAPI docs: http://localhost:8000/docs

### API surface

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/health` | DB ping |
| `POST` | `/products` | Create + embed-on-write |
| `GET` | `/products` | Paginated list |
| `GET` | `/products/{id}` | Detail |
| `PATCH` | `/products/{id}` | Update; re-embeds when text fields change |
| `DELETE` | `/products/{id}` | Delete |
| `POST` | `/search` | Hybrid: embed query + SQL filters + cosine rank |

`POST /search` body example:

```json
{
  "query": "lightweight summer jacket for rainy weather under $80",
  "max_price": 80,
  "category": "jackets",
  "in_stock_only": true,
  "limit": 10
}
```

Reindex CLI:

```bash
python -m app.reindex              # re-embed all
python -m app.reindex --only-missing
```

## Interview story (short)

1. Unstructured intent (“lightweight summer jacket for rainy weather under $80”) meets structured constraints (price, size, stock).
2. Product text is embedded on create/update and stored beside relational columns.
3. Search embeds the query, applies SQL filters, then ranks by vector similarity.
