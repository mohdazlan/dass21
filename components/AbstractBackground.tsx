"use client";

import TerendakMotif from "./TerendakMotif";

interface AbstractBackgroundProps {
  showPhotoPattern?: boolean;
}

export default function AbstractBackground({
  showPhotoPattern = true,
}: AbstractBackgroundProps) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-sago">
      {/* Melanau Terendak Authentic Photo Background Pattern */}
      {showPhotoPattern && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.25] mix-blend-multiply"
          style={{ backgroundImage: "url('/terendak-bg.jpg')" }}
        />
      )}

      {/* Soft ambient gradient mesh */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(201, 150, 46, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(142, 44, 33, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(232, 217, 176, 0.25) 0%, transparent 70%)
          `,
        }}
      />

      {/* SVG Abstract Woven Geometric Grid */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.20]"
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
            {/* Woven straw diamond grid */}
            <path
              d="M 30 0 L 60 30 L 30 60 L 0 30 Z"
              fill="none"
              stroke="#C9962E"
              strokeWidth="0.9"
            />
            <path
              d="M 30 10 L 50 30 L 30 50 L 10 30 Z"
              fill="none"
              stroke="#8E2C21"
              strokeWidth="0.5"
            />
            <circle cx="30" cy="30" r="2" fill="#C9962E" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#terendak-weave-pattern)" />
      </svg>

      {/* Floating abstract Terendak Motifs */}
      <TerendakMotif
        size={720}
        opacity={0.14}
        className="absolute -right-32 -top-24 select-none"
      />
      <TerendakMotif
        size={540}
        opacity={0.12}
        className="absolute -bottom-24 -left-24 rotate-45 select-none"
      />
      <TerendakMotif
        size={420}
        opacity={0.10}
        className="absolute top-1/3 -left-20 -rotate-12 select-none"
      />
    </div>
  );
}
