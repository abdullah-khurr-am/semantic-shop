import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center">
      <h1 className="font-display text-4xl">Product not found</h1>
      <p className="mt-3 text-[var(--ink-soft)]">
        That item may have been removed from the catalog.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-[var(--sea)] px-5 py-2.5 text-sm text-white"
      >
        Back to search
      </Link>
    </div>
  );
}
