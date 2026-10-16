import type { Product, SearchHit } from "@/lib/types";
import { ProductCard } from "./ProductCard";

type Props = {
  products: Array<Product | SearchHit>;
  emptyTitle: string;
  emptyBody: string;
};

export function ProductGrid({ products, emptyTitle, emptyBody }: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/50 px-6 py-16 text-center">
        <h2 className="font-display text-2xl">{emptyTitle}</h2>
        <p className="mx-auto mt-2 max-w-md text-[var(--ink-soft)]">{emptyBody}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/70"
        >
          <div className="skeleton aspect-[4/3]" />
          <div className="space-y-3 p-4">
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
