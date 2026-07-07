import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaringMinda",
  description:
    "Saringan kesihatan mental DASS-21 dan intervensi awal — alat saringan, bukan diagnosis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
