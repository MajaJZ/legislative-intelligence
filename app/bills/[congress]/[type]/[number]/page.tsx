import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InfluenceDashboard from "@/components/InfluenceDashboard";

export const dynamic = "force-dynamic";

export default async function BillPage({ params }: { params: Promise<{ congress: string; type: string; number: string }> }) {
  const { congress, type, number } = await params;
  const supabase = await createClient();

  const { data: bill } = await supabase.from("bills").select("*").eq("congress", Number(congress)).eq("bill_type", type).eq("number", Number(number)).single();
  if (!bill) notFound();

  const { data: scores } = await supabase.from("bill_influence_scores").select("*").eq("bill_id", bill.id);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="border-b border-border pb-6 mb-8">
        <p className="font-mono text-sm font-bold text-accent uppercase mb-2">{type} {number} | {congress}th Congress</p>
        <h1 className="text-3xl font-serif text-navy leading-tight mb-4">{bill.title}</h1>
        <p className="text-slate"><strong className="text-navy">Latest Action:</strong> {bill.latest_action || "N/A"}</p>
        <a href={`https://www.congress.gov/bill/${congress}th-congress/${type === 'hr' ? 'house' : 'senate'}-bill/${number}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-accent font-semibold underline hover:text-navy">
          Read Full Text on Congress.gov
        </a>
      </div>

      <div className="bg-white border border-border p-6 rounded shadow-sm">
        <h2 className="text-2xl font-serif text-navy mb-4 border-b border-border pb-2">Financial Influence Dashboard</h2>
        <InfluenceDashboard scores={scores || []} />
      </div>
    </div>
  );
}
