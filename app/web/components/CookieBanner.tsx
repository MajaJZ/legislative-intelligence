"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "li_cookie_consent_v1";

type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  async function save(analytics: boolean, marketing: boolean) {
    const consent: Consent = {
      necessary: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    };
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);

    await fetch("/api/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        consent_type: "cookie_banner",
        analytics,
        marketing,
        policy_version: "2026-01",
      }),
    });
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper p-4"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl text-sm">
          <p className="font-semibold">Cookie choices</p>
          <p className="mt-1 text-muted">
            Necessary cookies keep the site working. Analytics and marketing
            cookies are optional and are off until you accept them. You can
            change your choice at any time on the Cookie Policy page.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button onClick={() => save(false, false)} className="secondary">
            Reject non-essential
          </button>
          <button onClick={() => save(true, true)}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
