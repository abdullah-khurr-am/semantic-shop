"""Load the demo catalog. Embeddings remain null until reindex or product CRUD.

Usage (from apps/api with venv active):
    python -m app.seed
"""

from __future__ import annotations

import sys

from sqlalchemy import func, select

from app.db import SessionLocal
from app.models import Product
from app.seed_data import PRODUCTS


def seed(*, reset: bool = False) -> int:
    db = SessionLocal()
    try:
        existing = db.scalar(select(func.count()).select_from(Product)) or 0
        if existing and not reset:
            print(f"Catalog already has {existing} products; skipping (pass --reset to wipe).")
            return existing

        if reset and existing:
            db.query(Product).delete()
            db.commit()
            print(f"Removed {existing} existing products.")

        for row in PRODUCTS:
            db.add(Product(**row))
        db.commit()
        print(f"Seeded {len(PRODUCTS)} products (embeddings null until reindex/CRUD).")
        return len(PRODUCTS)
    finally:
        db.close()


def main() -> None:
    reset = "--reset" in sys.argv
    seed(reset=reset)


if __name__ == "__main__":
    main()
