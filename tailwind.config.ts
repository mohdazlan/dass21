import type { Config } from "tailwindcss";
import { terendakColors, terendakFonts } from "./lib/theme";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nipah: terendakColors.nipah,
        straw: terendakColors.straw,
        lacquer: terendakColors.lacquer,
        charcoal: terendakColors.charcoal,
        sago: terendakColors.sago,
      },
      fontFamily: {
        display: terendakFonts.display.split(","),
        body: terendakFonts.body.split(","),
      },
    },
  },
  plugins: [],
};

export default config;
