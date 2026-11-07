"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function InfluenceDashboard({ scores }: { scores: any[] }) {
  if (!scores.length) {
    return <p className="text-slate p-4 bg-gray-50 border border-border">No lobbying data matched to this bill yet.</p>;
  }

  return (
    <div>
      <div className="h-72 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={scores} layout="vertical" margin={{ left: 40, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="sector_code" width={100} tick={{ fontSize: 12, textTransform: "capitalize" }} />
            <Tooltip formatter={(val: number) => [`${val}/100`, "Score"]} />
            <Bar dataKey="alignment_score" fill="#0F172A" barSize={24}>
              {scores.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.alignment_score > 70 ? "#DC2626" : "#0F172A"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Added overflow-x-auto for mobile scrolling */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-border text-slate">
              <th className="py-2">Sector</th>
              <th className="py-2 text-right">Alignment Score</th>
              <th className="py-2 text-right">Lobbying Spend</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="py-3 font-semibold capitalize text-navy">{s.sector_code}</td>
                <td className="py-3 text-right font-mono">{s.alignment_score}</td>
                <td className="py-3 text-right font-mono text-slate">${Number(s.lobby_spend).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
