import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getClientConfig } from "@/lib/clients";
import ClientPortal from "@/components/ClientPortal";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = getClientConfig(slug);
  return {
    title: config ? `${config.name} — Northform Forge` : "Northform Forge",
  };
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const config = getClientConfig(slug);

  if (!config) notFound();

  return (
    <main className="min-h-screen bg-forge-bg">
      <header className="h-[52px] bg-forge-elevated border-b border-forge-border flex items-center">
        <div className="w-full max-w-4xl mx-auto px-8 flex items-center justify-between">
          <span
            className="text-forge-accent text-[13px] font-semibold tracking-[0.12em] uppercase"
            style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
          >
            Northform Forge
          </span>
          <span className="text-forge-muted text-[12px] font-mono">
            {config.slug}
          </span>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-8">
        <ClientPortal config={config} />
      </div>
    </main>
  );
}
