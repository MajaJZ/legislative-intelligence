export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl">Methodology</h1>
      <p className="mt-3 text-muted">
        This page documents exactly how the Financial Alignment Index is built.
        It is written so that a researcher, journalist, or member of the public
        can reproduce or challenge the result.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl">1. Sources</h2>
        <p className="text-muted">
          Bill text, sponsor, cosponsors, subjects, and actions come from the
          Congress.gov API v3. Campaign contributions come from FEC OpenFEC
          Schedule A. Lobbying income and expenses come from Senate LDA LD-2
          filings. OpenSecrets is not used because its public API was discontinued
          in April 2025.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl">2. Sector assignment</h2>
        <p className="text-muted">
          Lobbying filings carry general issue codes. Each sector in this project
          maps to a documented list of those codes. Contributions do not carry an
          official industry code, so the worker maps contributor employer strings
          to sectors using the keyword lists stored in the sectors table. This is
          an approximation and is disclosed as such.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl">3. Index formula</h2>
        <p className="text-muted">
          For each bill and sector, the worker computes a contribution percentile
          and a lobbying percentile across all bills in the same Congress. The
          index is 60 percent contribution percentile plus 40 percent lobbying
          percentile, scaled to 0 through 100. A confidence value reflects the
          number of matched contribution records and whether the bill's subject
          text directly matches the sector.
        </p>
        <p className="text-muted">
          The index is a relative rank, not an absolute measure. A score of 80
          means the bill ranks high relative to other bills in the same sector
          and Congress. It does not mean 80 percent of anything.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl">4. Suppression and statistics</h2>
        <p className="text-muted">
          Outcome comparisons are suppressed when either the high-alignment or
          low-alignment group has fewer than 30 bills. When both groups are large
          enough, the site may show a Fisher exact test result. An association is
          not evidence of causation. Many unmeasured factors affect bill passage.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl">5. Corrections</h2>
        <p className="text-muted">
          If you find a mapping error or a data quality problem, email
          data@legislativeintelligence.org with the bill number and the record in
          question. Corrections are logged in the public changelog.
        </p>
      </section>
    </div>
  );
}
