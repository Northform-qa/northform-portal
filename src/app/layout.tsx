import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Northform Forge",
  description: "QA Test Trigger Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-forge-bg text-forge-text antialiased">{children}</body>
    </html>
  );
}
