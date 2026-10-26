import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  consent_type: z.string().min(1).max(50),
  analytics: z.boolean(),
  marketing: z.boolean(),
  policy_version: z.string().min(1).max(20),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { error } = await supabase.from("consent_events").insert({
    user_id: userData?.user?.id ?? null,
    anonymous_id: request.headers.get("x-anonymous-id"),
    consent_type: parsed.data.consent_type,
    granted: parsed.data.analytics || parsed.data.marketing,
    policy_version: parsed.data.policy_version,
  });

  if (error) {
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
