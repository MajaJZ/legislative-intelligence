import Link from "next/link";
import BillSearch from "@/components/BillSearch";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* HERO SECTION */}
      <section className="border-b border-border py-20 md:py-28">
        <p className="data-text text-xs uppercase tracking-widest text-accent mb-4">
          Federal legislation and disclosed financial influence
        </p>
        <h1 className="max-w-4xl text-4xl leading-tight md:text-6xl text-navy">
          Read the bill. <br /> See the disclosed money around it.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate">
          Legislative Intelligence combines Congress.gov bill data with FEC campaign contributions and Senate lobbying disclosures. For every bill, you can see who sponsored it, which industries disclosed lobbying on related issues, and how much those industries contributed.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/bills" className="bg-navy text-white px-6 py-3 font-semibold hover:bg-slate transition-colors">
            Browse Bills
          </Link>
          <Link href="/methodology" className="border border-border bg-panel text-navy px-6 py-3 font-semibold hover:bg-gray-50 transition-colors">
            Read Methodology
          </Link>
        </div>
      </section>

      {/* SEARCH SECTION */}
      <section className="py-16 border-b border-border">
        <div className="max-w-3xl">
          <h2 className="text-2xl text-navy mb-2">Find a specific bill</h2>
          <p className="text-slate mb-6">Enter a bill number (e.g., HR 1) or search by title.</p>
          <BillSearch />
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 grid gap-12 md:grid-cols-3">
        <div className="border-t-2 border-navy pt-4">
          <h2 className="text-xl text-navy font-semibold mb-3">Bill Tracking</h2>
          <p className="text-slate text-sm leading-relaxed">
            Search by bill number, title, sponsor, or subject. Each record links directly to the official Congress.gov text and action history.
          </p>
        </div>
        <div className="border-t-2 border-navy pt-4">
          <h2 className="text-xl text-navy font-semibold mb-3">Disclosed Influence</h2>
          <p className="text-slate text-sm leading-relaxed">
            Lobbying totals come from Senate LDA filings. Contribution totals come from FEC Schedule A records. Every number links to its source.
          </p>
        </div>
        <div className="border-t-2 border-navy pt-4">
          <h2 className="text-xl text-navy font-semibold mb-3">Stated Limits</h2>
          <p className="text-slate text-sm leading-relaxed">
            The Financial Alignment Index measures association, not causation. Results are suppressed when sample sizes are too small. Read the methodology before drawing conclusions.
          </p>
        </div>
      </section>
    </div>
  );
}
