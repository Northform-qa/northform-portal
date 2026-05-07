import type { Conclusion, RunStatus, StepStatus } from "@/types";

interface Props {
  status: RunStatus | StepStatus;
  conclusion: Conclusion;
  size?: "sm" | "md";
}

type BadgeStyle = {
  label: string;
  bg: string;
  border: string;
  color: string;
  dotColor: string;
  animated: boolean;
};

const STYLES: Record<string, BadgeStyle> = {
  queued: {
    label: "Queued",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.25)",
    color: "#F59E0B",
    dotColor: "#F59E0B",
    animated: true,
  },
  in_progress: {
    label: "Running",
    bg: "rgba(30, 207, 160, 0.1)",
    border: "rgba(30, 207, 160, 0.2)",
    color: "#1ECFA0",
    dotColor: "#1ECFA0",
    animated: true,
  },
  completed_success: {
    label: "Passed",
    bg: "rgba(30, 207, 160, 0.1)",
    border: "rgba(30, 207, 160, 0.2)",
    color: "#1ECFA0",
    dotColor: "#1ECFA0",
    animated: false,
  },
  completed_failure: {
    label: "Failed",
    bg: "rgba(226, 75, 74, 0.1)",
    border: "rgba(226, 75, 74, 0.2)",
    color: "#E24B4A",
    dotColor: "#E24B4A",
    animated: false,
  },
  completed_cancelled: {
    label: "Cancelled",
    bg: "rgba(113, 113, 122, 0.1)",
    border: "rgba(113, 113, 122, 0.2)",
    color: "#71717A",
    dotColor: "#71717A",
    animated: false,
  },
  completed_skipped: {
    label: "Skipped",
    bg: "rgba(113, 113, 122, 0.1)",
    border: "rgba(113, 113, 122, 0.2)",
    color: "#71717A",
    dotColor: "#71717A",
    animated: false,
  },
  completed_null: {
    label: "Done",
    bg: "rgba(113, 113, 122, 0.1)",
    border: "rgba(113, 113, 122, 0.2)",
    color: "#71717A",
    dotColor: "#71717A",
    animated: false,
  },
};

export default function StatusBadge({ status, conclusion, size = "sm" }: Props) {
  const key =
    status === "completed" ? `completed_${conclusion ?? "null"}` : status;

  const style: BadgeStyle = STYLES[key] ?? STYLES.completed_null;
  const padding = size === "sm" ? "5px 10px" : "5px 12px";
  const fontSize = size === "sm" ? "12px" : "12px";
  const dotSize = "6px";

  return (
    <span
      className="inline-flex items-center font-mono font-medium rounded-full"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        padding,
        fontSize,
        borderRadius: "9999px",
        fontWeight: 500,
      }}
    >
      <span
        aria-hidden="true"
        className={style.animated ? "animate-pulse" : ""}
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: style.dotColor,
          display: "inline-block",
          marginRight: "6px",
          flexShrink: 0,
        }}
      />
      <span className="sr-only">{style.label}: </span>
      {style.label}
    </span>
  );
}
