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
      {/* Run-level status row */}
      {run && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge
              status={run.status}
              conclusion={run.conclusion}
              size="md"
            />
            {run.status === "completed" && resultsUrl && (
              <a
                href={resultsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-forge-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-forge-accent focus-visible:outline-offset-2 rounded"
              >
                View full report →
              </a>
            )}
          </div>
          <a
            href={run.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-forge-muted hover:text-forge-text transition-colors duration-150 font-mono text-[11px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-forge-accent focus-visible:outline-offset-2 rounded"
            aria-label={`View run #${run.id} on GitHub`}
          >
            #{run.id}
          </a>
        </div>
      )}

      {/* Waiting state */}
      {waiting && !fetchError && (
        <div className="flex items-center gap-2 text-forge-muted text-[13px]">
          <span
            aria-hidden="true"
            className="w-2 h-2 rounded-full bg-forge-accent animate-pulse flex-shrink-0"
          />
          <span className="sr-only">Status: </span>
          Waiting for run to start…
        </div>
      )}

      {/* Fetch error */}
      {fetchError && (
        <p role="alert" className="text-forge-failure text-[13px]">
          {fetchError}
        </p>
      )}

      {/* Job feed containers */}
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
    <div
      className="overflow-hidden"
      style={{
        background: "rgba(18, 18, 26, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "10px",
      }}
    >
      {/* Feed header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between text-left transition-colors duration-150 hover:bg-white/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-forge-accent focus-visible:outline-offset-[-2px]"
        style={{
          background: "rgba(26, 26, 36, 0.8)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          padding: "10px 16px",
        }}
      >
        <div className="flex items-center gap-3">
          <StatusBadge status={job.status} conclusion={job.conclusion} />
          <span
            className="text-forge-text text-[13px] font-medium"
            style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
          >
            {job.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-forge-muted text-[11px] font-mono">
          {dur && <span>{dur}</span>}
          <span aria-hidden="true">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Step rows */}
      {expanded && visibleSteps.length > 0 && (
        <div>
          {visibleSteps.map((step, i) => {
            const stepDur = formatDuration(step.startedAt, step.completedAt);
            const isLast = i === visibleSteps.length - 1;
            return (
              <div
                key={step.number}
                className="flex items-center justify-between"
                style={{
                  padding: "9px 16px",
                  borderBottom: isLast
                    ? "none"
                    : "1px solid rgba(255, 255, 255, 0.04)",
                }}
              >
                <div className="flex items-center gap-[10px]">
                  <StepIcon
                    status={step.status}
                    conclusion={step.conclusion}
                    stepName={step.name}
                  />
                  <span
                    className="text-[13px]"
                    style={{
                      color:
                        step.status === "queued"
                          ? "#A1A1AA"
                          : "#FAFAFA",
                    }}
                  >
                    {step.name}
                  </span>
                </div>
                {stepDur && (
                  <span className="text-forge-muted font-mono text-[11px]">
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
  stepName,
}: {
  status: string;
  conclusion: string | null;
  stepName: string;
}) {
  if (status === "in_progress") {
    return (
      <span
        aria-label={`${stepName}: in progress`}
        className="flex-shrink-0 w-4 text-center"
        style={{ color: "#F59E0B", fontSize: "14px", lineHeight: 1 }}
      >
        <span
          className="inline-block w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#F59E0B", borderTopColor: "transparent" }}
        />
      </span>
    );
  }
  if (status === "completed") {
    if (conclusion === "success") {
      return (
        <span
          aria-label={`${stepName}: passed`}
          className="flex-shrink-0 w-4 text-center text-forge-success"
          style={{ fontSize: "14px" }}
        >
          ✓
        </span>
      );
    }
    if (conclusion === "failure") {
      return (
        <span
          aria-label={`${stepName}: failed`}
          className="flex-shrink-0 w-4 text-center text-forge-failure"
          style={{ fontSize: "14px" }}
        >
          ✗
        </span>
      );
    }
    if (conclusion === "skipped") {
      return (
        <span
          aria-label={`${stepName}: skipped`}
          className="flex-shrink-0 w-4 text-center text-forge-muted"
          style={{ fontSize: "12px" }}
        >
          —
        </span>
      );
    }
  }
  // Pending
  return (
    <span
      aria-label={`${stepName}: pending`}
      className="flex-shrink-0 w-4 flex items-center justify-center"
    >
      <span
        aria-hidden="true"
        className="rounded-full bg-forge-muted"
        style={{ width: "6px", height: "6px" }}
      />
    </span>
  );
}
