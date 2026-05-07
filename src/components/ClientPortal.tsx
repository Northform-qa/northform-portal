"use client";

import { useState, useEffect, useCallback } from "react";
import type { ClientConfig } from "@/types";
import PassphraseGate from "./PassphraseGate";
import TriggerButton from "./TriggerButton";
import ResultsFeed from "./ResultsFeed";

interface Props {
  config: ClientConfig;
}

type Phase = "idle" | "triggering" | "polling" | "done";

export default function ClientPortal({ config }: Props) {
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [triggeredAt, setTriggeredAt] = useState<Date | null>(null);
  const [triggerError, setTriggerError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`nf:passphrase:${config.slug}`);
    if (stored) setPassphrase(stored);
  }, [config.slug]);

  function handleAuth(phrase: string) {
    sessionStorage.setItem(`nf:passphrase:${config.slug}`, phrase);
    setPassphrase(phrase);
  }

  function handleSignOut() {
    sessionStorage.removeItem(`nf:passphrase:${config.slug}`);
    setPassphrase(null);
    setPhase("idle");
    setTriggeredAt(null);
    setTriggerError(null);
  }

  async function handleTrigger() {
    if (!passphrase || phase === "triggering" || phase === "polling") return;

    setPhase("triggering");
    setTriggerError(null);

    try {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: config.slug, passphrase }),
      });

      if (res.status === 401) {
        handleSignOut();
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setTriggerError(data.error ?? "Trigger failed");
        setPhase("idle");
        return;
      }

      setTriggeredAt(new Date());
      setPhase("polling");
    } catch {
      setTriggerError("Network error");
      setPhase("idle");
    }
  }

  const handleComplete = useCallback(() => {
    setPhase("done");
  }, []);

  function handleRunAgain() {
    setPhase("idle");
    setTriggeredAt(null);
    setTriggerError(null);
  }

  if (!passphrase) {
    return <PassphraseGate slug={config.slug} onAuth={handleAuth} />;
  }

  const buttonLabel =
    phase === "triggering"
      ? "Triggering…"
      : phase === "polling"
      ? "Running…"
      : phase === "done"
      ? "Run Again"
      : "Run Tests";

  const buttonDisabled = phase === "triggering" || phase === "polling";

  return (
    <div className="pt-10 pb-12">
      {/* Header row */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1
            className="text-forge-text text-[20px] font-semibold"
            style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
          >
            {config.name}
          </h1>
          <p className="text-forge-muted text-[13px] mt-0.5">
            Playwright + API Test Suite
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-forge-muted text-[13px] transition-colors duration-150 hover:text-forge-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-forge-accent focus-visible:outline-offset-2 rounded"
          style={{ minWidth: "24px", minHeight: "24px" }}
        >
          Sign out
        </button>
      </div>

      {/* Trigger error */}
      {triggerError && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-forge-failure text-sm"
          role="alert"
          style={{
            background: "rgba(226, 75, 74, 0.1)",
            border: "1px solid rgba(226, 75, 74, 0.2)",
          }}
        >
          {triggerError}
        </div>
      )}

      {/* Full-width run button */}
      <TriggerButton
        onClick={phase === "done" ? handleRunAgain : handleTrigger}
        disabled={buttonDisabled}
        label={buttonLabel}
      />

      {/* View latest report link — idle state only */}
      {config.resultsUrl && phase === "idle" && (
        <div className="mt-3 text-center">
          <a
            href={config.resultsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-forge-muted hover:text-forge-text transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-forge-accent focus-visible:outline-offset-2 rounded"
          >
            View latest report →
          </a>
        </div>
      )}

      {/* Live run feed */}
      {triggeredAt && (
        <ResultsFeed
          key={triggeredAt.toISOString()}
          slug={config.slug}
          triggeredAt={triggeredAt}
          resultsUrl={config.resultsUrl}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
