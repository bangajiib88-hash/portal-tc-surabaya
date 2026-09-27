// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "./theme-toggle";

export function Topbar({ title }: { title: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Berhasil keluar.");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-[rgb(var(--border))] bg-surface px-6 py-4">
      <h1 className="font-display text-lg font-700">{title}</h1>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          aria-label="Keluar"
          className="flex h-9 w-9 items-center justify-center rounded-control border border-[rgb(var(--border))] text-ink-soft transition hover:text-brand-red"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
