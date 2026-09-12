import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaringMinda",
  description:
    "Saringan kesihatan mental DASS-21 dan intervensi awal — alat saringan, bukan diagnosis.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
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
