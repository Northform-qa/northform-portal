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
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-forge-text">
            {config.name}
          </h1>
          <p className="text-forge-muted text-sm mt-1">
            Playwright + API Test Suite
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs text-forge-muted hover:text-forge-text transition-colors mt-1"
        >
          Sign out
        </button>
      </div>

      {triggerError && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-950/40 border border-red-800/40 text-forge-failure text-sm">
          {triggerError}
        </div>
      )}

      <div className="flex items-center gap-4">
        <TriggerButton
          onClick={phase === "done" ? handleRunAgain : handleTrigger}
          disabled={buttonDisabled}
          label={buttonLabel}
        />
        {config.resultsUrl && phase === "idle" && (
          <a
            href={config.resultsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-forge-muted hover:text-forge-primary transition-colors"
          >
            View latest report →
          </a>
        )}
      </div>

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
