import Link from "next/link";
import BillSearch from "@/components/BillSearch";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="border-b border-line py-16 md:py-24">
        <p className="data text-xs uppercase tracking-widest text-accent">
          Federal legislation, disclosed money
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight md:text-5xl">
          Read the bill. See the disclosed money around it.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          Legislative Intelligence combines Congress.gov bill data with FEC
          campaign contributions and Senate lobbying disclosures. For every bill,
          you can see who sponsored it, which industries disclosed lobbying on
          related issues, and how much those industries contributed to the
          sponsor and cosponsors.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/bills" className="btn no-underline">
            Browse bills
          </Link>
          <Link href="/methodology" className="btn secondary no-underline">
            Read the methodology
          </Link>
        </div>
      </section>

      <section className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <h2 className="text-xl">Bill tracking</h2>
          <p className="mt-3 text-muted">
            Search by bill number, title, sponsor, or subject. Each record links
            to the official Congress.gov text and action history.
          </p>
        </div>
        <div>
          <h2 className="text-xl">Disclosed influence</h2>
          <p className="mt-3 text-muted">
            Lobbying totals come from Senate LDA filings. Contribution totals
            come from FEC Schedule A records. Every number links to its source.
          </p>
        </div>
        <div>
          <h2 className="text-xl">Stated limits</h2>
          <p className="mt-3 text-muted">
            The Financial Alignment Index measures association, not causation.
            Results are suppressed when sample sizes are too small. Read the
            methodology before drawing conclusions.
          </p>
        </div>
      </section>

      <section className="border-t border-line py-14">
        <h2 className="text-2xl">Find a bill</h2>
        <p className="mt-2 text-muted">
          Enter a bill number such as HR 1 or S 2572, or search by title.
        </p>
        <div className="mt-6 max-w-2xl">
          <BillSearch />
        </div>
      </section>
    </div>
  );
}
