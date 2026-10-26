"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BillSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const cleaned = query.trim().toUpperCase().replace(/\s+/g, " ");
    const match = cleaned.match(/^(HR|S|HJRES|SJRES|HCONRES|SCONRES|HRES|SRES)\s*(\d+)$/);
    if (match) {
      const type = match[1].toLowerCase();
      const number = match[2];
      router.push(`/bills/119/${type}/${number}`);
      return;
    }
    router.push(`/bills?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="bill-query" className="sr-only">
        Bill number or title
      </label>
      <input
        id="bill-query"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="HR 1, S 2572, or a title"
        className="w-full border border-line bg-panel px-3 py-2 text-ink"
        autoComplete="off"
      />
      <button type="submit">Search</button>
    </form>
  );
}
