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
      <header className="border-b border-forge-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-forge-primary font-mono text-xs tracking-widest uppercase">
            Northform Forge
          </span>
          <span className="text-forge-muted text-xs font-mono">{config.slug}</span>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <ClientPortal config={config} />
      </div>
    </main>
  );
}
