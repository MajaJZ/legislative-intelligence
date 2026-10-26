"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Score = {
  sector_code: string;
  alignment_score: number;
  confidence: number;
  lobby_spend: number;
  contribution_total: number;
  sample_size: number;
};

const SECTOR_LABELS: Record<string, string> = {
  health: "Health and pharmaceuticals",
  finance: "Finance and insurance",
  energy: "Energy and utilities",
  tech: "Technology and telecom",
  defense: "Defense and aerospace",
  transport: "Transportation",
  agriculture: "Agriculture and food",
  labor: "Labor and employment",
  education: "Education",
  legal: "Legal and professional services",
};

export default function InfluenceDashboard({ scores }: { scores: Score[] }) {
  if (!scores.length) {
    return (
      <p className="border border-line bg-panel p-5 text-muted">
        No sector-level alignment score is available for this bill yet. Scores
        require matched lobbying and contribution records.
      </p>
    );
  }

  const chartData = scores.map((score) => ({
    name: SECTOR_LABELS[score.sector_code] ?? score.sector_code,
    score: score.alignment_score,
    confidence: score.confidence,
  }));

  return (
    <div>
      <div className="h-80 w-full border border-line bg-panel p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={220}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)} / 100`, "Alignment index"]}
              contentStyle={{ border: "1px solid #D6D2C8", borderRadius: 2, fontSize: 12 }}
            />
            <Bar dataKey="score" barSize={18}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.confidence >= 0.7 ? "#1E4A5A" : "#8A3B2E"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
        <span><span className="inline-block h-3 w-3 align-middle" style={{ background: "#1E4A5A" }} /> Higher confidence</span>
        <span><span className="inline-block h-3 w-3 align-middle" style={{ background: "#8A3B2E" }} /> Lower confidence, interpret with caution</span>
      </div>

      <div className="mt-8 overflow-x-auto border border-line">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-panel text-left">
            <tr>
              <th className="border-b border-line px-3 py-2 font-semibold">Sector</th>
              <th className="border-b border-line px-3 py-2 font-semibold text-right">Index</th>
              <th className="border-b border-line px-3 py-2 font-semibold text-right">Confidence</th>
              <th className="border-b border-line px-3 py-2 font-semibold text-right">Lobbying disclosed</th>
              <th className="border-b border-line px-3 py-2 font-semibold text-right">Contributions to sponsor</th>
              <th className="border-b border-line px-3 py-2 font-semibold text-right">Matched records</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score) => (
              <tr key={score.sector_code} className="border-b border-line last:border-0">
                <td className="px-3 py-2">{SECTOR_LABELS[score.sector_code] ?? score.sector_code}</td>
                <td className="data px-3 py-2 text-right">{score.alignment_score.toFixed(1)}</td>
                <td className="data px-3 py-2 text-right">{Math.round(score.confidence * 100)}%</td>
                <td className="data px-3 py-2 text-right">${formatMoney(score.lobby_spend)}</td>
                <td className="data px-3 py-2 text-right">${formatMoney(score.contribution_total)}</td>
                <td className="data px-3 py-2 text-right">{score.sample_size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-3xl text-xs text-muted">
        The index combines disclosed lobbying spend on related issue codes and
        disclosed contributions from employer-matched donors to the sponsor and
        cosponsors. It is a descriptive percentile score, not a probability that
        money changed a vote. See the methodology page for the exact formula,
        limitations, and suppression rules.
      </p>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value ?? 0);
}
