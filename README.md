# Semantic Shop

Hybrid semantic product search for e-commerce: natural-language queries combined with structured SQL filters (price, size, stock) via Postgres + `pgvector`.

This is an interview-ready demo of a data-architecture problem — bridging unstructured embeddings with relational constraints — not a chatbot wrapper.

## Stack

| Layer | Choice |
|-------|--------|
| Storefront | Next.js App Router + TypeScript — `apps/web` |
| API | FastAPI (Python) — `apps/api` |
| Database | PostgreSQL 16 + `pgvector` (Docker) |
| Embeddings | OpenAI `text-embedding-3-small` (1536 dims) |

## Architecture (interview talking points)

```text
User query ──► embed(query) ──┐
                              ├─► SQL WHERE (price, size, stock, category)
Product rows ◄── cosine rank ◄┘   + ORDER BY embedding <=> query_vector
```

1. **Unstructured intent** — “lightweight summer jacket for rainy weather under $80”
2. **Structured constraints** — max price, category, sizes, in-stock stay in SQL
3. **Embed-on-write** — create/update of text fields re-embeds and stores the vector beside the row
4. **Hybrid rank** — filters first (or conjunctively), then vector similarity

Tradeoffs worth mentioning: embedding cost/latency on writes, HNSW vs IVFFlat, and moving embeds to a queue for production.

## Quick start

### 1. Infra

```bash
docker compose up -d   # Postgres + pgvector on localhost:5434
cp .env.example .env   # then set a real OPENAI_API_KEY
```

### 2. API

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python -m app.seed
python -m app.reindex --only-missing   # needs OPENAI_API_KEY
uvicorn app.main:app --reload --port 8000
```

Docs: http://localhost:8000/docs

### 3. Storefront

```bash
cd apps/web
cp ../../.env.example .env.local   # or export NEXT_PUBLIC_API_URL
# ensure NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

App: http://localhost:3000

## Demo script (5 minutes)

1. Open the home page — default query + filters already set for the rain-jacket story.
2. Show results with match scores; click through to a product detail page.
3. Go to **Admin** → create a quirky product (“glow-in-the-dark picnic tarp for misty festivals”).
4. Search for it with different wording (“waterproof outdoor blanket for damp evenings”).
5. Walk the schema: `products.embedding vector(1536)`, HNSW index, `POST /search` SQL shape.

## API surface

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/health` | DB ping |
| `POST` | `/products` | Create + embed-on-write |
| `GET` | `/products` | Paginated list |
| `GET` | `/products/{id}` | Detail |
| `PATCH` | `/products/{id}` | Update; re-embeds when text fields change |
| `DELETE` | `/products/{id}` | Delete |
| `POST` | `/search` | Hybrid: embed query + SQL filters + cosine rank |

`POST /search` example:

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
python -m app.reindex
python -m app.reindex --only-missing
```

## Repo layout

```text
semantic-shop/
  apps/web/          # Next.js storefront
  apps/api/          # FastAPI + Alembic + seed/reindex
  docker-compose.yml
  .env.example
  README.md
```

## Out of scope (by design)

Cart, auth, payments, and production deploy. Mention as next steps if asked.
