import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("bills")
    .select("id,congress,bill_type,number,title,latest_action,latest_action_date,sponsor_bioguide_id")
    .eq("congress", 119)
    .order("latest_action_date", { ascending: false })
    .limit(50);

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data: bills, error } = await query;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl">Bills</h1>
      <p className="mt-2 max-w-2xl text-muted">
        The 119th Congress. Records update from Congress.gov. Select a bill to
        see its text, actions, and disclosed financial alignment.
      </p>

      <form className="mt-6 flex max-w-xl gap-2" action="/bills">
        <label htmlFor="q" className="sr-only">Search bills by title</label>
        <input
          id="q"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by title"
          className="w-full border border-line bg-panel px-3 py-2"
        />
        <button type="submit">Search</button>
      </form>

      {error && <p className="mt-6 text-warn">Could not load bills. Try again.</p>}

      <div className="mt-8 divide-y divide-line border-y border-line">
        {bills?.map((bill) => (
          <Link
            key={bill.id}
            href={`/bills/${bill.congress}/${bill.bill_type}/${bill.number}`}
            className="block py-5 no-underline text-ink hover:bg-panel"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="data text-xs uppercase text-accent">
                {bill.bill_type.toUpperCase()} {bill.number}
              </span>
              <span className="text-xs text-muted">{bill.latest_action_date}</span>
            </div>
            <p className="mt-1 font-serif text-lg leading-snug">{bill.title}</p>
            <p className="mt-1 text-sm text-muted">{bill.latest_action}</p>
          </Link>
        ))}
        {bills?.length === 0 && (
          <p className="py-8 text-muted">No bills match this search.</p>
        )}
      </div>
    </div>
  );
}
