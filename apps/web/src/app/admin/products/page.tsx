"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/ProductForm";
import { createProduct, listProducts } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listProducts(100, 0);
      setProducts(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-8">
      <section className="space-y-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Catalog admin</h1>
          <p className="mt-1 text-[var(--ink-soft)]">
            Create a product live, then search for it by meaning on the home page.
          </p>
        </div>
        <ProductForm
          submitLabel="Create product"
          onSubmit={async (payload) => {
            await createProduct(payload);
            await refresh();
          }}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl">Products ({total})</h2>
          <button
            type="button"
            onClick={() => void refresh()}
            className="text-sm text-[var(--sea)] underline-offset-2 hover:underline"
          >
            Refresh
          </button>
        </div>
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-[var(--ink-soft)]">Loading…</p>
        ) : (
          <ul className="space-y-2">
            {products.map((product) => (
              <li
                key={product.id}
                className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-[var(--ink-soft)]">
                      ${product.price} · {product.category}
                      {product.has_embedding ? " · embedded" : " · pending embed"}
                    </p>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-[var(--sea)] hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-[var(--ink-soft)] hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
