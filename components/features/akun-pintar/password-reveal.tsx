// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordReveal({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm tabular-nums">
        {visible ? value : "•".repeat(Math.min(value.length, 14) || 8)}
      </span>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan password pintar" : "Lihat password pintar"}
        className="text-ink-soft transition hover:text-brand-blue"
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
