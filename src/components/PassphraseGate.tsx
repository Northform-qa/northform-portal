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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-52px)] px-4">
      <div style={{ width: "340px" }}>
        {/* Eyebrow */}
        <p
          className="text-forge-accent text-[11px] font-semibold uppercase text-center"
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            letterSpacing: "0.14em",
            marginBottom: "14px",
          }}
        >
          Northform Forge
        </p>

        {/* Title */}
        <h2
          className="text-forge-text text-[26px] font-semibold text-center"
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            marginBottom: "8px",
          }}
        >
          Enter passphrase
        </h2>

        {/* Subtitle */}
        <p
          className="text-forge-muted text-[14px] text-center"
          style={{ marginBottom: "32px" }}
        >
          to access the{" "}
          <span className="text-forge-text font-medium">{slug}</span> workspace
        </p>

        <form onSubmit={handleSubmit}>
          {/* Visually-hidden label for screen readers */}
          <label htmlFor="passphrase" className="sr-only">
            Passphrase
          </label>

          <input
            id="passphrase"
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Passphrase"
            autoFocus
            autoComplete="current-password"
            aria-describedby={error ? "passphrase-error" : undefined}
            aria-invalid={error ? true : undefined}
            className="w-full text-forge-text text-[14px] placeholder:text-forge-muted rounded-lg transition-all duration-150 focus:outline-none"
            style={{
              height: "44px",
              padding: "0 16px",
              marginBottom: "10px",
              background: "rgba(26, 26, 36, 0.8)",
              border: error
                ? "1px solid #E24B4A"
                : "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: undefined,
            }}
            onFocus={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.5)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(245, 158, 11, 0.15)";
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error
                ? "#E24B4A"
                : "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.boxShadow = "";
            }}
          />

          {error && (
            <p
              id="passphrase-error"
              role="alert"
              className="text-forge-failure text-[13px]"
              style={{ marginBottom: "10px" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="w-full rounded-lg text-[14px] font-medium transition-[filter] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-forge-accent focus-visible:outline-offset-2"
            style={{
              height: "44px",
              ...(loading || !value.trim()
                ? {
                    background: "rgba(245, 158, 11, 0.1)",
                    color: "#F59E0B",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    cursor: "default",
                  }
                : {
                    background: "#F59E0B",
                    color: "#0A0A0F",
                    border: "none",
                  }),
            }}
            onMouseEnter={(e) => {
              if (!loading && value.trim()) {
                (e.currentTarget as HTMLButtonElement).style.filter =
                  "brightness(1.1)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.filter = "";
            }}
          >
            {loading ? "Verifying…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
