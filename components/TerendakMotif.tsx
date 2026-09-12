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
 * TerendakMotif — an original, abstract line rendering of a Melanau `terendak`
 * (conical woven sun hat) seen from the front: a shallow cone crowned with a
 * finial, filled with concentric woven bands. Purely geometric artwork (no
 * photographs); intended as a subtle, low-opacity background flourish.
 */
export default function TerendakMotif({
  size = 320,
  opacity = 0.08,
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
      {/* Cone outline: apex finial down to the two brim tips */}
      <path
        d="M100 14 L182 118 Q100 138 18 118 Z"
        fill="none"
        stroke={terendakColors.lacquer}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Concentric woven bands following the cone's slope */}
      <path
        d="M100 34 L162 112 Q100 128 38 112 Z"
        fill="none"
        stroke={terendakColors.nipah}
        strokeWidth={1.5}
      />
      <path
        d="M100 54 L143 106 Q100 120 57 106 Z"
        fill="none"
        stroke={terendakColors.nipah}
        strokeWidth={1.5}
      />
      <path
        d="M100 74 L124 101 Q100 111 76 101 Z"
        fill="none"
        stroke={terendakColors.nipah}
        strokeWidth={1.5}
      />

      {/* Radial weave lines from apex to the brim */}
      <g stroke={terendakColors.charcoal} strokeWidth={1}>
        <line x1="100" y1="14" x2="60" y2="121" />
        <line x1="100" y1="14" x2="100" y2="128" />
        <line x1="100" y1="14" x2="140" y2="121" />
      </g>

      {/* Finial at the apex */}
      <circle cx="100" cy="14" r="5" fill={terendakColors.lacquer} />
    </svg>
  );
}
