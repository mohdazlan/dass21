/**
 * Terendak design tokens — SaringMinda
 *
 * Visual identity draws on the Melanau `terendak` (a conical woven sun hat),
 * using its earthy woven palette and layered concentric bands. Colours and
 * type roles are the single source of truth, consumed by tailwind.config.ts.
 */

export const terendakColors = {
  /** nipah gold — primary accent */
  nipah: "#C9962E",
  /** woven straw — warm neutral for bands/borders */
  straw: "#E8D9B0",
  /** deep lacquer red — emphasis / alerts */
  lacquer: "#8E2C21",
  /** charcoal black — primary text */
  charcoal: "#241F1C",
  /** off-white sago — page background */
  sago: "#FAF6EC",
} as const;

/**
 * Font role tokens. Values are CSS font-family stacks; the display role is a
 * serif for headings, the body role a humanist sans for body and form text.
 */
export const terendakFonts = {
  /** display serif — headings */
  display: '"Playfair Display", "Times New Roman", Georgia, serif',
  /** humanist sans — body & form text */
  body: '"Source Sans 3", "Segoe UI", system-ui, -apple-system, sans-serif',
} as const;

export type TerendakColor = keyof typeof terendakColors;
export type TerendakFont = keyof typeof terendakFonts;
