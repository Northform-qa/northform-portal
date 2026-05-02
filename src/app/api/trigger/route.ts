import { NextRequest, NextResponse } from "next/server";
import { getClientConfig } from "@/lib/clients";
import { dispatchWorkflow } from "@/lib/github";

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

  const config = getClientConfig(slug);
  if (!config) {
    return NextResponse.json({ error: "Unknown client" }, { status: 404 });
  }

  const key = `PORTAL_PASSPHRASE_${slug.toUpperCase().replace(/-/g, "_")}`;
  const expected = process.env[key];
  if (!expected || passphrase !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dispatchWorkflow(
      config.owner,
      config.repo,
      config.workflowFile,
      config.branch
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Dispatch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
