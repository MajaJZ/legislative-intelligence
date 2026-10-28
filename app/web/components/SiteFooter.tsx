import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-panel mt-20">
      <div className="mx-auto max-w-6xl px-6 py-12 text-sm text-slate grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-bold text-navy mb-2">Legislative Intelligence</p>
          <p>A project of Civic Data Studio LLC.</p>
          <p className="mt-2">Sądowa 2, 46-020<br />Opole, Poland 20005</p>
          <p className="mt-2">legislativeintelligence@gmail.com</p>
        </div>
        <div>
          <p className="font-bold text-navy mb-2">Legal & Data</p>
          <ul className="space-y-2">
            <li><Link href="/legal/terms" className="hover:text-navy">Terms of Service</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-navy">Privacy Policy</Link></li>
            <li><Link href="/legal/cookies" className="hover:text-navy">Cookie Policy</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-navy mb-2">Sources</p>
          <ul className="space-y-2">
            <li><a href="https://api.congress.gov" className="hover:text-navy">Congress.gov API</a></li>
            <li><a href="https://api.open.fec.gov" className="hover:text-navy">FEC OpenFEC</a></li>
            <li><a href="https://lda.gov" className="hover:text-navy">Senate LDA</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
