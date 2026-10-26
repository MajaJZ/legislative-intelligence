import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        
        <Link href="/" className="font-serif text-xl no-underline text-ink">
          Legislative Intelligence
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-6 text-sm">
          <Link href="/bills" className="no-underline text-ink">
            Bills
          </Link>
          <Link href="/methodology" className="no-underline text-ink">
            Methodology
          </Link>
          <Link href="/account" className="no-underline text-ink">
            Account
          </Link>
        </nav>
      </div>
    </header>
  );
}
