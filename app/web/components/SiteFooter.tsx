import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm md:grid-cols-4">
        <div>
          <p className="font-serif text-base font-semibold">Legislative Intelligence</p>
          <p className="mt-2 text-muted">
            A project of Civic Data Studio LLC.
          </p>
          <p className="mt-2 text-muted">
            1201 K Street NW, Suite 400<br />
            Washington, DC 20005<br />
            United States
          </p>
          <p className="mt-2 text-muted">
            contact@legislativeintelligence.org
          </p>
        </div>
        <div>
          <p className="font-semibold">Product</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/bills">Bills</Link></li>
            <li><Link href="/methodology">Methodology</Link></li>
            <li><Link href="/subscribe">Subscribe</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Legal</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/legal/terms">Terms of Service</Link></li>
            <li><Link href="/legal/privacy">Privacy Policy</Link></li>
            <li><Link href="/legal/cookies">Cookie Policy</Link></li>
            <li><Link href="/legal/refund">Refund Policy</Link></li>
            <li><Link href="/legal/dmca">DMCA</Link></li>
            <li><Link href="/legal/accessibility">Accessibility</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Data</p>
          <ul className="mt-2 space-y-1">
            <li><a href="https://api.congress.gov" rel="noopener noreferrer">Congress.gov API</a></li>
            <li><a href="https://api.open.fec.gov" rel="noopener noreferrer">OpenFEC</a></li>
            <li><a href="https://lda.gov" rel="noopener noreferrer">Senate LDA</a></li>
          </ul>
          <p className="mt-4 text-xs text-muted">
            Fonts: Source Serif 4, Inter, IBM Plex Mono. Licensed under SIL Open Font License 1.1. See LICENSES.md.
          </p>
        </div>
      </div>
    </footer>
  );
}
