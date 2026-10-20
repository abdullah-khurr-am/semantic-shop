import Image from "next/image";
import Link from "next/link";
import type { Product, SearchHit } from "@/lib/types";

function formatPrice(price: string) {
  const value = Number(price);
  if (Number.isNaN(value)) return `$${price}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

type Props = {
  product: Product | SearchHit;
};

export function ProductCard({ product }: Props) {
  const score = "score" in product ? product.score : undefined;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block animate-rise overflow-hidden rounded-2xl border border-[var(--line)] bg-white/80 shadow-[var(--shadow)] transition duration-300 hover:-translate-y-1 hover:border-[var(--sea)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--mist)]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--ink-soft)]">
            No image
          </div>
        )}
        {!product.in_stock && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--ink)]/80 px-2.5 py-1 text-xs text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg leading-snug tracking-tight">
            {product.name}
          </h3>
          <p className="shrink-0 text-sm font-medium text-[var(--sea-deep)]">
            {formatPrice(product.price)}
          </p>
        </div>
        <p className="line-clamp-2 text-sm text-[var(--ink-soft)]">
          {product.description}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ink-soft)]">
          <span className="uppercase tracking-[0.12em]">{product.category}</span>
          {score !== undefined && (
            <span className="rounded-full bg-[var(--mist)] px-2 py-0.5 text-[var(--sea-deep)]">
              match {(score * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
