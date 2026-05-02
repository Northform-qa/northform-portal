export type RunStatus = "queued" | "in_progress" | "completed";
export type Conclusion = "success" | "failure" | "cancelled" | "skipped" | null;
export type StepStatus = "queued" | "in_progress" | "completed";

export interface WorkflowRun {
  id: number;
  status: RunStatus;
  conclusion: Conclusion;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface Step {
  name: string;
  status: StepStatus;
  conclusion: Conclusion;
  number: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface Job {
  id: number;
  name: string;
  status: RunStatus;
  conclusion: Conclusion;
  startedAt: string | null;
  completedAt: string | null;
  steps: Step[];
}

export interface ClientConfig {
  slug: string;
  name: string;
  owner: string;
  repo: string;
  workflowFile: string;
  branch: string;
  resultsUrl?: string;
}

export interface StatusResponse {
  run: WorkflowRun | null;
  jobs: Job[];
}
