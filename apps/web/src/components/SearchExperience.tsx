"use client";

import { useEffect, useState } from "react";
import { ApiError, searchProducts } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { SearchHit } from "@/lib/types";
import { FilterBar, type FilterState } from "./FilterBar";
import { ProductGrid, ProductGridSkeleton } from "./ProductGrid";

const DEFAULT_QUERY = "lightweight summer jacket for rainy weather under $80";

const initialFilters: FilterState = {
  minPrice: "",
  maxPrice: "80",
  category: "jackets",
  sizes: [],
  inStockOnly: true,
};

export function SearchExperience() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const debouncedFilters = useDebouncedValue(filters, 300);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setHits([]);
      setError(null);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        setError(null);
        const min = debouncedFilters.minPrice
          ? Number(debouncedFilters.minPrice)
          : undefined;
        const max = debouncedFilters.maxPrice
          ? Number(debouncedFilters.maxPrice)
          : undefined;

        const result = await searchProducts({
          query: trimmed,
          min_price: Number.isFinite(min) ? min : undefined,
          max_price: Number.isFinite(max) ? max : undefined,
          category: debouncedFilters.category || undefined,
          sizes: debouncedFilters.sizes,
          in_stock_only: debouncedFilters.inStockOnly,
          limit: 18,
        });

        if (!cancelled) {
          setHits(result.items);
          setHasSearched(true);
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Search failed";
        setError(message);
        setHits([]);
        setHasSearched(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, debouncedFilters]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 pb-20 md:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--ink)] text-white shadow-[var(--shadow)]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)] via-[var(--ink)]/85 to-transparent" />
        <div className="relative z-10 max-w-2xl px-6 py-14 md:px-10 md:py-20">
          <p className="animate-rise font-display text-4xl tracking-tight md:text-6xl">
            Semantic Shop
          </p>
          <h1 className="animate-rise-delay mt-4 max-w-xl text-lg text-white/85 md:text-xl">
            Ask for what you mean — we blend natural-language embeddings with
            price, size, and stock filters.
          </h1>
          <label className="animate-rise-delay mt-8 block">
            <span className="mb-2 block text-sm uppercase tracking-[0.16em] text-white/70">
              Search
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='e.g. "packable rain shell for humid travel"'
              className="w-full rounded-2xl border border-white/20 bg-white/95 px-4 py-3.5 text-[var(--ink)] outline-none ring-[var(--sea)] placeholder:text-[var(--ink-soft)] focus:ring-2"
            />
          </label>
        </div>
      </section>

      <FilterBar value={filters} onChange={setFilters} />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Results</h2>
          {loading && (
            <span
              className="text-sm text-[var(--sea)]"
              style={{ animation: "pulse-soft 1.2s ease infinite" }}
            >
              Searching…
            </span>
          )}
          {!loading && hasSearched && !error && (
            <span className="text-sm text-[var(--ink-soft)]">
              {hits.length} match{hits.length === 1 ? "" : "es"}
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
            {error.toLowerCase().includes("openai") ||
            error.toLowerCase().includes("embedding") ? (
              <span className="mt-1 block text-red-700/80">
                Set a real OPENAI_API_KEY and run{" "}
                <code className="rounded bg-white/70 px-1">
                  python -m app.reindex
                </code>{" "}
                so the catalog has vectors.
              </span>
            ) : null}
          </div>
        )}

        {loading && !hits.length ? (
          <ProductGridSkeleton />
        ) : (
          <ProductGrid
            products={hits}
            emptyTitle={hasSearched ? "No products matched" : "Start typing"}
            emptyBody={
              hasSearched
                ? "Try loosening filters or rephrasing the query."
                : "Natural language search will appear here after a short debounce."
            }
          />
        )}
      </section>
    </div>
  );
}
