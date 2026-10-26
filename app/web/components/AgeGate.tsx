"use client";

import { useState } from "react";

export default function AgeGate({ onVerified }: { onVerified: () => void }) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  function checkAge(event: React.FormEvent) {
    event.preventDefault();
    const d = Number(day);
    const m = Number(month);
    const y = Number(year);
    const birth = new Date(y, m - 1, d);
    if (
      !d || !m || !y ||
      birth.getDate() !== d ||
      birth.getMonth() !== m - 1 ||
      birth.getFullYear() !== y
    ) {
      setError("Enter a valid date.");
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }

    if (age < 13) {
      setError("This service is not available to children under 13.");
      return;
    }
    if (age < 16) {
      setError("You must be at least 16 to create an account.");
      return;
    }

    onVerified();
  }

  return (
    <form onSubmit={checkAge} className="max-w-md space-y-4">
      <p className="text-sm text-muted">
        Enter your date of birth. We use it only to check that you are at least
        16. We do not store the date.
      </p>
      <div className="flex gap-2">
        <div>
          <label htmlFor="dob-day" className="block text-xs text-muted">Day</label>
          <input
            id="dob-day"
            inputMode="numeric"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-16 border border-line bg-panel px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="dob-month" className="block text-xs text-muted">Month</label>
          <input
            id="dob-month"
            inputMode="numeric"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-16 border border-line bg-panel px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="dob-year" className="block text-xs text-muted">Year</label>
          <input
            id="dob-year"
            inputMode="numeric"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-24 border border-line bg-panel px-2 py-1"
          />
        </div>
      </div>
      {error && <p className="text-sm text-warn">{error}</p>}
      <button type="submit">Continue</button>
    </form>
  );
}
