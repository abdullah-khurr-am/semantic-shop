"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/ProductForm";
import { deleteProduct, getProduct, updateProduct } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getProduct(params.id);
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load product");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 text-[var(--ink-soft)]">
        Loading product…
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-5 py-10">
        <p className="text-red-700">{error ?? "Product not found"}</p>
        <Link href="/admin/products" className="text-[var(--sea)] hover:underline">
          Back to admin
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-5 py-8 md:px-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Edit product</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{product.id}</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (!window.confirm("Delete this product?")) return;
            await deleteProduct(product.id);
            router.push("/admin/products");
          }}
          className="text-sm text-red-700 hover:underline"
        >
          Delete
        </button>
      </div>
      <ProductForm
        initial={product}
        submitLabel="Save changes"
        onSubmit={async (payload) => {
          const updated = await updateProduct(product.id, payload);
          setProduct(updated);
        }}
      />
      <Link href="/admin/products" className="inline-block text-sm text-[var(--sea)] hover:underline">
        ← Back to admin
      </Link>
    </div>
  );
}
