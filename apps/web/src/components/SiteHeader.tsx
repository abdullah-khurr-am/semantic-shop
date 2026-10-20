import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
      <Link href="/" className="group flex items-baseline gap-2">
        <span className="font-display text-2xl tracking-tight text-[var(--ink)] transition group-hover:text-[var(--sea)] md:text-3xl">
          Semantic Shop
        </span>
      </Link>
      <nav className="flex items-center gap-5 text-sm text-[var(--ink-soft)]">
        <Link href="/" className="transition hover:text-[var(--sea)]">
          Search
        </Link>
        <Link
          href="/admin/products"
          className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1.5 transition hover:border-[var(--sea)] hover:text-[var(--sea)]"
        >
          Admin
        </Link>
      </nav>
    </header>
  );
}
