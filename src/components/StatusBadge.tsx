import type { Conclusion, RunStatus, StepStatus } from "@/types";

interface Props {
  status: RunStatus | StepStatus;
  conclusion: Conclusion;
  size?: "sm" | "md";
}

const LABEL: Record<string, string> = {
  queued: "Queued",
  in_progress: "Running",
  completed_success: "Passed",
  completed_failure: "Failed",
  completed_cancelled: "Cancelled",
  completed_skipped: "Skipped",
  completed_null: "Done",
};

const COLOR: Record<string, string> = {
  queued: "text-forge-running bg-amber-950/40 border-amber-800/40",
  in_progress: "text-forge-primary bg-cyan-950/40 border-cyan-800/40",
  completed_success: "text-forge-success bg-green-950/40 border-green-800/40",
  completed_failure: "text-forge-failure bg-red-950/40 border-red-800/40",
  completed_cancelled: "text-forge-muted bg-zinc-900/40 border-zinc-700/40",
  completed_skipped: "text-forge-muted bg-zinc-900/40 border-zinc-700/40",
  completed_null: "text-forge-muted bg-zinc-900/40 border-zinc-700/40",
};

const DOT: Record<string, string> = {
  queued: "bg-forge-running animate-pulse",
  in_progress: "bg-forge-primary animate-pulse",
  completed_success: "bg-forge-success",
  completed_failure: "bg-forge-failure",
  completed_cancelled: "bg-forge-muted",
  completed_skipped: "bg-forge-muted",
  completed_null: "bg-forge-muted",
};

export default function StatusBadge({ status, conclusion, size = "sm" }: Props) {
  const key =
    status === "completed" ? `completed_${conclusion ?? "null"}` : status;

  const label = LABEL[key] ?? status;
  const color = COLOR[key] ?? "text-forge-muted bg-zinc-900/40 border-zinc-700/40";
  const dot = DOT[key] ?? "bg-forge-muted";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full font-mono ${
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      } ${color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
}
