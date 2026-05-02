"use client";

import { useState, type FormEvent } from "react";

interface Props {
  slug: string;
  onAuth: (passphrase: string) => void;
}

export default function PassphraseGate({ slug, onAuth }: Props) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, passphrase: value }),
      });

      if (res.ok) {
        onAuth(value);
      } else {
        setError("Incorrect passphrase.");
        setValue("");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-forge-primary text-xs font-mono tracking-widest uppercase mb-2">
            Northform Forge
          </p>
          <h2 className="text-2xl font-semibold text-forge-text">Enter passphrase</h2>
          <p className="text-forge-muted text-sm mt-2">
            to access the{" "}
            <span className="font-mono text-forge-text">{slug}</span> workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Passphrase"
            autoFocus
            className="
              w-full px-4 py-3 rounded-lg
              bg-forge-surface border border-forge-border
              text-forge-text placeholder:text-forge-muted
              focus:outline-none focus:border-forge-primary
              font-mono text-sm transition-colors
            "
          />

          {error && (
            <p className="text-forge-failure text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="
              w-full py-3 rounded-lg font-semibold text-sm
              bg-forge-primary text-forge-bg
              hover:bg-forge-primary-dim
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
