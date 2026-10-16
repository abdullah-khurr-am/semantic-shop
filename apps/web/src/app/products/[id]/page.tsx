import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getProduct } from "@/lib/api";

type Props = {
  params: Promise<{ id: string }>;
};

function formatPrice(price: string) {
  const value = Number(price);
  if (Number.isNaN(value)) return `$${price}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  let product;
  try {
    product = await getProduct(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 md:grid-cols-2 md:px-8 md:py-12">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--mist)] shadow-[var(--shadow)]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--ink-soft)]">
            No image
          </div>
        )}
      </div>

      <div className="animate-rise space-y-5">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--ink-soft)]">
          {product.brand || "House"} · {product.category}
        </p>
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">
          {product.name}
        </h1>
        <p className="text-2xl text-[var(--sea-deep)]">
          {formatPrice(product.price)}
        </p>
        <p className="text-[var(--ink-soft)] leading-relaxed">
          {product.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-sm"
            >
              {size}
            </span>
          ))}
        </div>
        <p className="text-sm text-[var(--ink-soft)]">
          {product.in_stock ? "In stock" : "Out of stock"}
          {product.has_embedding
            ? " · Embedded for semantic search"
            : " · Embedding pending"}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/"
            className="rounded-full bg-[var(--sea)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--sea-deep)]"
          >
            Back to search
          </Link>
          <Link
            href={`/admin/products/${product.id}`}
            className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm hover:border-[var(--sea)]"
          >
            Edit in admin
          </Link>
        </div>
      </div>
    </div>
  );
}
