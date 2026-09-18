"use client";

import TerendakMotif from "./TerendakMotif";

type BackgroundVariant = "student" | "staff";

interface AbstractBackgroundProps {
  /**
   * "student" — full Terendak photo + motifs (default)
   * "staff"  — clean, subtle gradient only
   */
  variant?: BackgroundVariant;
}

export default function AbstractBackground({
  variant = "student",
}: AbstractBackgroundProps) {
  /* ── Staff / Pensyarah: clean, minimal background ── */
  if (variant === "staff") {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-sago">
        {/* Soft ambient gradient — professional & subtle */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 0%, rgba(201, 150, 46, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 100%, rgba(142, 44, 33, 0.06) 0%, transparent 50%)
            `,
          }}
        />
        {/* Very faint diamond weave — barely visible */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="staff-weave"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 30 0 L 60 30 L 30 60 L 0 30 Z"
                fill="none"
                stroke="#C9962E"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#staff-weave)" />
        </svg>
      </div>
    );
  }

  /* ── Student / Pelajar: Terendak photo + motifs ── */
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-sago">
      {/* Melanau Terendak photo — subtle watermark */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.12]"
        style={{ backgroundImage: "url('/terendak-bg.jpg')" }}
      />

      {/* Soft translucent wash so text stays readable */}
      <div className="absolute inset-0 bg-sago/60" />

      {/* Faint woven diamond grid */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.10]"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="terendak-weave-pattern"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 30 0 L 60 30 L 30 60 L 0 30 Z"
              fill="none"
              stroke="#C9962E"
              strokeWidth="0.8"
            />
            <path
              d="M 30 10 L 50 30 L 30 50 L 10 30 Z"
              fill="none"
              stroke="#8E2C21"
              strokeWidth="0.4"
            />
            <circle cx="30" cy="30" r="2" fill="#C9962E" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#terendak-weave-pattern)" />
      </svg>

      {/* Subtle floating Terendak motifs */}
      <TerendakMotif
        size={600}
        opacity={0.08}
        className="absolute -right-24 -top-16 select-none"
      />
      <TerendakMotif
        size={480}
        opacity={0.06}
        className="absolute -bottom-16 -left-16 rotate-12 select-none"
      />
    </div>
  );
}
