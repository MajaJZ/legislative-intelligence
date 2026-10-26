import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(320),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("deletion_requests").insert({
    email: parsed.data.email,
    status: "received",
  });

  if (error) {
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }

  // Production: send a verification email with a signed token.
  // After verification, an operator or scheduled job deletes the account
  // and personal data, and marks this request completed within 45 days.
  return NextResponse.json({ ok: true });
}
