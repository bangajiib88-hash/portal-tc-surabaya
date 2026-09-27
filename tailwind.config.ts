// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Token warna brand — diturunkan dari identitas Indomaret,
        // tapi disesuaikan agar cukup kontras untuk data-dense HR dashboard.
        brand: {
          blue: "#0B3D82",      // biru utama — sidebar, aksi primer
          "blue-deep": "#062B5E",
          red: "#D62B1F",       // aksen peringatan/urgent
          yellow: "#F5B400",    // aksen highlight/status
        },
        ink: {
          DEFAULT: "#101826",   // teks utama, bukan hitam pekat
          soft: "#4B5567",
        },
        paper: {
          DEFAULT: "#F5F7FA",   // background terang
          dark: "#0B1220",      // background gelap
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#141C2E",
        },
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
        control: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
