"use client";

import { useState, useEffect } from "react";
import type { WorkflowRun, Job, StatusResponse } from "@/types";
import StatusBadge from "./StatusBadge";

interface Props {
  slug: string;
  triggeredAt: Date;
  resultsUrl?: string;
  onComplete?: () => void;
}

function formatDuration(
  startedAt: string | null,
  completedAt: string | null
): string | null {
  if (!startedAt || !completedAt) return null;
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export default function ResultsFeed({
  slug,
  triggeredAt,
  resultsUrl,
  onComplete,
}: Props) {
  const [run, setRun] = useState<WorkflowRun | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [waiting, setWaiting] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout>;
    let lockedRunId: number | null = null;
    // 90s buffer to tolerate GitHub/client clock skew after dispatch
    const cutoff = triggeredAt.getTime() - 90_000;

    async function tick() {
      if (!active) return;
      try {
        const url = lockedRunId
          ? `/api/status?slug=${slug}&runId=${lockedRunId}`
          : `/api/status?slug=${slug}`;
        const res = await fetch(url);

        if (!res.ok) {
          if (active) setFetchError("Failed to fetch status");
          if (active) timeoutId = setTimeout(tick, 5000);
          return;
        }

        const data = (await res.json()) as StatusResponse;
        if (!active) return;

        if (data.run && new Date(data.run.createdAt).getTime() >= cutoff) {
          lockedRunId = data.run.id;
          setRun(data.run);
          setJobs(data.jobs ?? []);
          setWaiting(false);
          setFetchError(null);

          if (data.run.status === "completed") {
            onComplete?.();
            return; // stop polling
          }
        } else {
          setWaiting(true);
        }
      } catch {
        if (active) setFetchError("Network error");
      }
      if (active) timeoutId = setTimeout(tick, 5000);
    }

    tick();

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [slug, triggeredAt, onComplete]);

  return (
    <div className="mt-8 space-y-4">
      {run && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={run.status} conclusion={run.conclusion} size="md" />
            {run.status === "completed" && resultsUrl && (
              <a
                href={resultsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-forge-primary hover:underline"
              >
                View full report →
              </a>
            )}
          </div>
          <a
            href={run.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-forge-muted hover:text-forge-primary font-mono transition-colors"
          >
            #{run.id}
          </a>
        </div>
      )}

      {waiting && !fetchError && (
        <div className="flex items-center gap-2 text-forge-muted text-sm">
          <span className="w-2 h-2 rounded-full bg-forge-running animate-pulse flex-shrink-0" />
          Waiting for run to start…
        </div>
      )}

      {fetchError && (
        <p className="text-forge-failure text-sm">{fetchError}</p>
      )}

      {jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobRow({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(true);
  const dur = formatDuration(job.startedAt, job.completedAt);

  const visibleSteps = job.steps.filter(
    (s) => s.name !== "Set up job" && s.name !== "Complete job"
  );

  return (
    <div className="border border-forge-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-forge-surface hover:bg-zinc-900/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <StatusBadge status={job.status} conclusion={job.conclusion} />
          <span className="text-forge-text text-sm font-medium">{job.name}</span>
        </div>
        <div className="flex items-center gap-3 text-forge-muted text-xs font-mono">
          {dur && <span>{dur}</span>}
          <span>{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && visibleSteps.length > 0 && (
        <div className="divide-y divide-forge-border">
          {visibleSteps.map((step) => {
            const stepDur = formatDuration(step.startedAt, step.completedAt);
            return (
              <div
                key={step.number}
                className="flex items-center justify-between px-4 py-2.5 bg-forge-bg"
              >
                <div className="flex items-center gap-3">
                  <StepIcon
                    status={step.status}
                    conclusion={step.conclusion}
                  />
                  <span className="text-sm text-forge-text">{step.name}</span>
                </div>
                {stepDur && (
                  <span className="text-xs text-forge-muted font-mono">
                    {stepDur}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepIcon({
  status,
  conclusion,
}: {
  status: string;
  conclusion: string | null;
}) {
  if (status === "in_progress") {
    return (
      <span className="w-3 h-3 rounded-full border-2 border-forge-primary border-t-transparent animate-spin flex-shrink-0" />
    );
  }
  if (status === "completed") {
    if (conclusion === "success")
      return <span className="text-forge-success text-sm w-3">✓</span>;
    if (conclusion === "failure")
      return <span className="text-forge-failure text-sm w-3">✗</span>;
    if (conclusion === "skipped")
      return (
        <span className="text-forge-muted text-xs w-3 text-center">—</span>
      );
  }
  return (
    <span className="w-1.5 h-1.5 rounded-full bg-forge-muted flex-shrink-0" />
  );
}
