import type { ClientConfig } from "@/types";

const CLIENTS: Record<string, ClientConfig> = {
  northformqa: {
    slug: "northformqa",
    name: "Northform QA",
    owner: "Northform-qa",
    repo: "northform",
    workflowFile: "client-northformqa-playwright.yml",
    branch: "main",
    resultsUrl:
      "https://northform-qa.github.io/northform/client-northformqa/latest/",
  },
};

export function getClientConfig(slug: string): ClientConfig | null {
  return CLIENTS[slug] ?? null;
}

export function getAllSlugs(): string[] {
  return Object.keys(CLIENTS);
}
