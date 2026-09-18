import type { CSSProperties } from "react";
import { terendakColors } from "@/lib/theme";

type TerendakMotifProps = {
  /** Rendered size in px (width == height, the motif is square). */
  size?: number;
  /** Overall opacity — kept low for use as a background element. */
  opacity?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * TerendakMotif — an authentic artistic line rendering of a Melanau `terendak`
 * (conical woven sun hat) featuring chevron/diamond traditional weave bands,
 * radial ribs, and the distinct top finial.
 */
export default function TerendakMotif({
  size = 320,
  opacity = 0.25,
  className,
  style,
}: TerendakMotifProps) {
  return (
    <svg
      viewBox="0 0 200 140"
      width={size}
      height={size}
      role="img"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ opacity, ...style }}
    >
      {/* Outer cone silhouette with subtle fill */}
      <path
        d="M100 12 L188 120 Q100 140 12 120 Z"
        fill={terendakColors.straw}
        fillOpacity={0.15}
        stroke={terendakColors.lacquer}
        strokeWidth={3}
        strokeLinejoin="round"
      />

      {/* Main concentric weave arches */}
      <path
        d="M100 32 L168 114 Q100 130 32 114 Z"
        fill="none"
        stroke={terendakColors.nipah}
        strokeWidth={2}
      />
      <path
        d="M100 52 L148 108 Q100 122 52 108 Z"
        fill="none"
        stroke={terendakColors.lacquer}
        strokeWidth={1.8}
      />
      <path
        d="M100 72 L128 102 Q100 112 72 102 Z"
        fill="none"
        stroke={terendakColors.nipah}
        strokeWidth={1.8}
      />

      {/* Melanau traditional zigzag / chevron weave band */}
      <path
        d="M36 114 L50 98 L64 115 L78 99 L92 116 L100 101 L108 116 L122 99 L136 115 L150 98 L164 114"
        fill="none"
        stroke={terendakColors.lacquer}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Radial weave spokes from apex */}
      <g stroke={terendakColors.charcoal} strokeWidth={1.2} opacity={0.6}>
        <line x1="100" y1="12" x2="40" y2="120" />
        <line x1="100" y1="12" x2="70" y2="124" />
        <line x1="100" y1="12" x2="100" y2="128" />
        <line x1="100" y1="12" x2="130" y2="124" />
        <line x1="100" y1="12" x2="160" y2="120" />
      </g>

      {/* Iconic Terendak Crown Finial */}
      <circle cx="100" cy="12" r="7" fill={terendakColors.lacquer} />
      <circle cx="100" cy="12" r="3.5" fill={terendakColors.nipah} />
    </svg>
  );
}
