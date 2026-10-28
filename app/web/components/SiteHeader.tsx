import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-panel">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-bold text-navy hover:text-accent transition-colors">
          Legislative Intelligence
        </Link>
        <nav className="flex items-center gap-8 text-sm font-semibold text-slate">
          <Link href="/bills" className="hover:text-navy">Bills</Link>
          <Link href="/methodology" className="hover:text-navy">Methodology</Link>
          <Link href="/account" className="hover:text-navy">Account</Link>
        </nav>
      </div>
    </header>
  );
}
