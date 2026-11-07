import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BillsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("bills").select("*").order("introduced_date", { ascending: false }).limit(50);
  
  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data: bills, error } = await query;

  // This will display the REAL error on the page if the database fails
  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-serif text-navy mb-2">Error loading bills</h1>
        <pre className="bg-red-50 text-red-800 p-4 rounded overflow-auto text-sm">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-serif text-navy mb-2">{q ? `Search Results for "${q}"` : "Recent Bills"}</h1>
      <p className="text-slate mb-8">Browsing the 119th Congress</p>

      <div className="divide-y divide-border border-y border-border">
        {bills?.map((bill) => (
          <Link key={bill.id} href={`/bills/${bill.congress}/${bill.bill_type}/${bill.number}`} className="block py-6 hover:bg-gray-50 px-4 transition-colors">
            <div className="flex gap-4 items-baseline mb-2">
              <span className="font-mono text-xs font-bold text-accent uppercase">{bill.bill_type} {bill.number}</span>
              <span className="text-xs text-slate">{bill.introduced_date}</span>
            </div>
            <p className="font-serif text-lg text-navy leading-snug">{bill.title}</p>
            <p className="text-sm text-slate mt-1">{bill.latest_action}</p>
          </Link>
        ))}
        {bills?.length === 0 && <p className="py-8 text-slate">No bills found matching "{q}".</p>}
      </div>
    </div>
  );
}
