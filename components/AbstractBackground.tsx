"use client";

import TerendakMotif from "./TerendakMotif";

interface AbstractBackgroundProps {
  showPhotoPattern?: boolean;
}

export default function AbstractBackground({
  showPhotoPattern = true,
}: AbstractBackgroundProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-sago">
      {/* Melanau Terendak Authentic Photo Background Pattern */}
      {showPhotoPattern && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45"
          style={{ backgroundImage: "url('/terendak-bg.jpg')" }}
        />
      )}

      {/* Soft translucent wash over center so forms remain completely readable */}
      <div className="absolute inset-0 bg-sago/45" />

      {/* SVG Abstract Woven Geometric Diamond Grid */}
      <svg
        className="absolute inset-0 h-full w-full opacity-30"
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
              strokeWidth="1.2"
            />
            <path
              d="M 30 10 L 50 30 L 30 50 L 10 30 Z"
              fill="none"
              stroke="#8E2C21"
              strokeWidth="0.8"
            />
            <circle cx="30" cy="30" r="2.5" fill="#C9962E" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#terendak-weave-pattern)" />
      </svg>

      {/* Floating authentic Terendak Motifs */}
      <TerendakMotif
        size={680}
        opacity={0.35}
        className="absolute -right-24 -top-16 select-none"
      />
      <TerendakMotif
        size={520}
        opacity={0.30}
        className="absolute -bottom-16 -left-16 rotate-12 select-none"
      />
      <TerendakMotif
        size={420}
        opacity={0.25}
        className="absolute top-1/3 -left-12 -rotate-12 select-none"
      />
      <TerendakMotif
        size={420}
        opacity={0.25}
        className="absolute top-2/3 -right-12 rotate-6 select-none"
      />
    </div>
  );
}
