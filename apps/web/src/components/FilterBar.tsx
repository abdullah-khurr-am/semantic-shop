"use client";

import { CATEGORIES, COMMON_SIZES } from "@/lib/types";

export type FilterState = {
  minPrice: string;
  maxPrice: string;
  category: string;
  sizes: string[];
  inStockOnly: boolean;
};

type Props = {
  value: FilterState;
  onChange: (next: FilterState) => void;
  inferred?: boolean;
};

export function FilterBar({ value, onChange, inferred = false }: Props) {
  function toggleSize(size: string) {
    const sizes = value.sizes.includes(size)
      ? value.sizes.filter((item) => item !== size)
      : [...value.sizes, size];
    onChange({ ...value, sizes });
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white/70 p-4 backdrop-blur md:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Filters</h2>
          <p className="text-sm text-[var(--ink-soft)]">
            {inferred
              ? "Auto-filled from your search text (price, category, size). Edit anytime to override."
              : "Manual override on — structured SQL filters applied with vector ranking."}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onChange({
              minPrice: "",
              maxPrice: "",
              category: "",
              sizes: [],
              inStockOnly: false,
            })
          }
          className="text-sm text-[var(--sea)] underline-offset-2 hover:underline"
        >
          Clear
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--ink-soft)]">Min price</span>
          <input
            type="number"
            min={0}
            step="1"
            value={value.minPrice}
            onChange={(event) =>
              onChange({ ...value, minPrice: event.target.value })
            }
            placeholder="0"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--sea)] focus:ring-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--ink-soft)]">Max price</span>
          <input
            type="number"
            min={0}
            step="1"
            value={value.maxPrice}
            onChange={(event) =>
              onChange({ ...value, maxPrice: event.target.value })
            }
            placeholder="80"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--sea)] focus:ring-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--ink-soft)]">Category</span>
          <select
            value={value.category}
            onChange={(event) =>
              onChange({ ...value, category: event.target.value })
            }
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--sea)] focus:ring-2"
          >
            <option value="">Any</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            checked={value.inStockOnly}
            onChange={(event) =>
              onChange({ ...value, inStockOnly: event.target.checked })
            }
            className="size-4 accent-[var(--sea)]"
          />
          In stock only
        </label>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm text-[var(--ink-soft)]">Sizes</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_SIZES.map((size) => {
            const active = value.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  active
                    ? "border-[var(--sea)] bg-[var(--sea)] text-white"
                    : "border-[var(--line)] bg-white text-[var(--ink-soft)] hover:border-[var(--sea)]"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
