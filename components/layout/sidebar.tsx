// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, KeyRound, ClipboardCheck, Info } from "lucide-react";
import { getInitials, cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const menuUser = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/akun-pintar", label: "Akun Pintar", icon: KeyRound },
  { href: "/absensi", label: "Absensi Training", icon: ClipboardCheck },
];

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[rgb(var(--border))] bg-surface px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        {profile.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.foto_url}
            alt={profile.nama}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue font-display text-sm font-700 text-white">
            {getInitials(profile.nama)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{profile.nama}</p>
          <p className="truncate text-xs text-ink-soft">{profile.jabatan ?? "-"}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {menuUser.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand-blue text-white"
                  : "text-ink-soft hover:bg-[rgb(var(--bg))]"
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/tentang"
        className="flex items-center gap-3 rounded-control px-3 py-2.5 text-sm text-ink-soft hover:bg-[rgb(var(--bg))]"
      >
        <Info size={17} />
        Tentang Aplikasi
      </Link>
    </aside>
  );
}
