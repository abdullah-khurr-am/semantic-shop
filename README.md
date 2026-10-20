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

### 1. Env

```bash
cp .env.example .env   # then set a real OPENAI_API_KEY
```

### 2. Backend (Docker) — start / stop yourself

```bash
# Start Postgres + API (migrates + seeds on boot)
docker compose up -d --build

# Stop everything
docker compose down

# Logs / restart API only
docker compose logs -f api
docker compose restart api

# Embed the catalog (needs OPENAI_API_KEY in .env)
docker compose exec api python -m app.reindex --only-missing
```

- API: http://localhost:8000 · Docs: http://localhost:8000/docs  
- Postgres (host tools): `localhost:5434`

### 3. Storefront (local Node)

```bash
cd apps/web
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

App: http://localhost:3000

### Optional: API on the host (without Docker for the API)

```bash
docker compose up -d db
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head && python -m app.seed
python -m app.reindex --only-missing
uvicorn app.main:app --reload --port 8000
```

## Demo script (5 minutes)

1. Open the home page (search starts empty).
2. Type a natural-language query — filters sync from the text (price, category, size).
3. Show ranked results with match scores; click through to a product detail page.
4. Go to **Admin** → create a quirky product (“glow-in-the-dark picnic tarp for misty festivals”).
5. Search for it with different wording (“waterproof outdoor blanket for damp evenings”).
6. Walk the schema: `products.embedding vector(1536)`, HNSW index, `POST /search` SQL shape.

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
docker compose exec api python -m app.reindex --only-missing
# or on the host:
python -m app.reindex --only-missing
```

## Repo layout

```text
semantic-shop/
  apps/web/          # Next.js storefront
  apps/api/          # FastAPI + Alembic + seed/reindex (+ Dockerfile)
  docker-compose.yml # Postgres + API
  .env.example
  README.md
```

## Out of scope (by design)

Cart, auth, payments, and production deploy. Mention as next steps if asked.
