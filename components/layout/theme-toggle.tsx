// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hindari mismatch hydration: render setelah client mount
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
      className="flex h-9 w-9 items-center justify-center rounded-control border border-[rgb(var(--border))] text-ink-soft transition hover:text-brand-yellow"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
