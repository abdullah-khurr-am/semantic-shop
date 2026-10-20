"use client";

import { useState, type FormEvent } from "react";
import type { Product, ProductInput } from "@/lib/types";
import { CATEGORIES, COMMON_SIZES } from "@/lib/types";

type Props = {
  initial?: Product;
  submitLabel: string;
  onSubmit: (payload: ProductInput) => Promise<void>;
};

export function ProductForm({ initial, submitLabel, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "jackets");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? ["M", "L"]);
  const [inStock, setInStock] = useState(initial?.in_stock ?? true);
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toggleSize(size: string) {
    setSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category,
        brand: brand.trim(),
        price,
        sizes,
        in_stock: inStock,
        image_url: imageUrl.trim() || null,
      });
      setSuccess(
        initial
          ? "Product updated. Text fields re-embed when changed."
          : "Product created. Embedding runs on write when OPENAI_API_KEY is set.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/80 p-5 shadow-[var(--shadow)]"
    >
      <label className="block text-sm">
        <span className="mb-1.5 block text-[var(--ink-soft)]">Name</span>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--sea)] focus:ring-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-[var(--ink-soft)]">Description</span>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--sea)] focus:ring-2"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--ink-soft)]">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--sea)] focus:ring-2"
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--ink-soft)]">Brand</span>
          <input
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--sea)] focus:ring-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--ink-soft)]">Price</span>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--sea)] focus:ring-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--ink-soft)]">Image URL</span>
          <input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--sea)] focus:ring-2"
          />
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm text-[var(--ink-soft)]">Sizes</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_SIZES.map((size) => {
            const active = sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  active
                    ? "border-[var(--sea)] bg-[var(--sea)] text-white"
                    : "border-[var(--line)] bg-white"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(event) => setInStock(event.target.checked)}
          className="size-4 accent-[var(--sea)]"
        />
        In stock
      </label>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-[var(--sea)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--sea-deep)] disabled:opacity-60"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
