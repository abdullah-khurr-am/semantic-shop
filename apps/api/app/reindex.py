"""Bulk (re)embed the product catalog.

Usage (from apps/api with venv active and OPENAI_API_KEY set):

    python -m app.reindex
    python -m app.reindex --only-missing
    python -m app.reindex --batch-size 16
"""

from __future__ import annotations

import argparse
import sys

from app.db import SessionLocal
from app.embeddings import EmbeddingError
from app.services import reindex_products


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Re-embed products into pgvector")
    parser.add_argument(
        "--only-missing",
        action="store_true",
        help="Only embed rows where embedding IS NULL",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=32,
        help="OpenAI batch size (default: 32)",
    )
    args = parser.parse_args(argv)

    db = SessionLocal()
    try:
        result = reindex_products(
            db,
            only_missing=args.only_missing,
            batch_size=args.batch_size,
        )
    except EmbeddingError as exc:
        print(f"Embedding error: {exc}", file=sys.stderr)
        return 1
    finally:
        db.close()

    print(
        "Reindex complete: "
        f"total={result['total']} succeeded={result['succeeded']} failed={result['failed']}"
    )
    return 0 if result["failed"] == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
