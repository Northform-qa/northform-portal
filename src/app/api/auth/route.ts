import { NextRequest, NextResponse } from "next/server";
import { getClientConfig } from "@/lib/clients";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { slug, passphrase } = body as Record<string, unknown>;
  if (typeof slug !== "string" || typeof passphrase !== "string") {
    return NextResponse.json({ error: "Missing slug or passphrase" }, { status: 400 });
  }

  if (!getClientConfig(slug)) {
    return NextResponse.json({ error: "Unknown client" }, { status: 404 });
  }

  const key = `PORTAL_PASSPHRASE_${slug.toUpperCase().replace(/-/g, "_")}`;
  const expected = process.env[key];

  if (!expected || passphrase !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
