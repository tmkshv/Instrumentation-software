/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"IBM Plex Sans"', "ui-sans-serif", "sans-serif"],
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        // Ground: Mars-surface tones.
        umbra: "#0B0806",
        soil: "#16110C",
        rock: "#231912",
        dusk: "#3A2A1B",
        hair: "#54402C",
        // Inked typography: bone-cream on umbra.
        bone: "#EFE3D0",
        sand: "#BEA888",
        ash: "#6F5E4A",
        // Primary accent: cyan blue (#11BFB5).
        rust: "#11BFB5",
        ember: "#47D4CB",
        amber: "#6BC9C2",
        sage: "#7FA05E",
        blood: "#BE2F2B",
        lake: "#3A5973",
      },
      letterSpacing: {
        widest: "0.22em",
      },
      animation: {
        "fade-up": "fadeUp 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "sweep-in": "sweepIn 900ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "breathe": "breathe 2.4s ease-in-out infinite",
        "scan": "scan 6s linear infinite",
        "flicker": "flicker 1.2s ease-out",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        sweepIn: {
          "0%": { opacity: "0", transform: "translateX(-24px) scaleX(0.98)" },
          "100%": { opacity: "1", transform: "translateX(0) scaleX(1)" },
        },
        breathe: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(17,191,181,0.55)" },
          "50%": { opacity: "0.7", boxShadow: "0 0 0 10px rgba(17,191,181,0)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "12%": { opacity: "0.4" },
          "25%": { opacity: "1" },
          "40%": { opacity: "0.7" },
          "55%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
