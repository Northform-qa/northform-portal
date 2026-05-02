import { NextRequest, NextResponse } from "next/server";
import { getClientConfig } from "@/lib/clients";
import { getLatestRun, getRun, getRunJobs } from "@/lib/github";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const runIdParam = searchParams.get("runId");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const config = getClientConfig(slug);
  if (!config) {
    return NextResponse.json({ error: "Unknown client" }, { status: 404 });
  }

  let runId = runIdParam ? parseInt(runIdParam, 10) : null;

  const run = runId
    ? await getRun(config.owner, config.repo, runId)
    : await getLatestRun(config.owner, config.repo, config.workflowFile, config.branch);

  if (run && !runId) runId = run.id;

  const jobs = runId ? await getRunJobs(config.owner, config.repo, runId) : [];

  return NextResponse.json({ run, jobs });
}
