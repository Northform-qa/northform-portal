import type { WorkflowRun, Job } from "@/types";

const BASE = "https://api.github.com";

function authHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not configured");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function dispatchWorkflow(
  owner: string,
  repo: string,
  workflowFile: string,
  ref: string,
  inputs: Record<string, string> = {}
): Promise<void> {
  const res = await fetch(
    `${BASE}/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`,
    {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ ref, inputs }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub dispatch ${res.status}: ${text}`);
  }
}

export async function getLatestRun(
  owner: string,
  repo: string,
  workflowFile: string,
  branch: string
): Promise<WorkflowRun | null> {
  const res = await fetch(
    `${BASE}/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(workflowFile)}/runs?branch=${encodeURIComponent(branch)}&per_page=1`,
    { headers: authHeaders() }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { workflow_runs?: unknown[] };
  const r = data.workflow_runs?.[0];
  if (!r) return null;
  return mapRun(r);
}

export async function getRun(
  owner: string,
  repo: string,
  runId: number
): Promise<WorkflowRun | null> {
  const res = await fetch(
    `${BASE}/repos/${owner}/${repo}/actions/runs/${runId}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return null;
  return mapRun(await res.json());
}

export async function getRunJobs(
  owner: string,
  repo: string,
  runId: number
): Promise<Job[]> {
  const res = await fetch(
    `${BASE}/repos/${owner}/${repo}/actions/runs/${runId}/jobs?per_page=30`,
    { headers: authHeaders() }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { jobs?: unknown[] };
  return (data.jobs ?? []).map(mapJob);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRun(r: any): WorkflowRun {
  return {
    id: r.id as number,
    status: r.status,
    conclusion: r.conclusion,
    url: r.html_url as string,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapJob(j: any): Job {
  return {
    id: j.id as number,
    name: j.name as string,
    status: j.status,
    conclusion: j.conclusion,
    startedAt: j.started_at as string | null,
    completedAt: j.completed_at as string | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    steps: (j.steps ?? []).map((s: any) => ({
      name: s.name as string,
      status: s.status,
      conclusion: s.conclusion,
      number: s.number as number,
      startedAt: s.started_at as string | null,
      completedAt: s.completed_at as string | null,
    })),
  };
}
