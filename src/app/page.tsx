import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-forge-bg flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-forge-primary text-xs font-mono tracking-widest mb-3 uppercase">
          Northform
        </p>
        <h1 className="text-4xl font-bold text-forge-text mb-4">Forge</h1>
        <p className="text-forge-muted text-sm mb-8">
          QA Test Trigger Portal — access your workspace at{" "}
          <code className="text-forge-primary font-mono">/[client-slug]</code>
        </p>
        <Link
          href="/northformqa"
          className="text-sm text-forge-muted hover:text-forge-primary transition-colors"
        >
          → northformqa demo
        </Link>
      </div>
    </main>
  );
}
