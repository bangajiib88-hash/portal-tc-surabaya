// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  MessageSquareText,
  FileUp,
  ScrollText,
  Settings,
  ArrowLeftRight,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const menuAdmin = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Data User", icon: Users },
  { href: "/admin/trainings", label: "Training", icon: GraduationCap },
  { href: "/admin/reminder-wa", label: "Reminder WA", icon: MessageSquareText },
  { href: "/admin/import-export", label: "Impor / Ekspor", icon: FileUp },
  { href: "/admin/audit-log", label: "Log Aktivitas", icon: ScrollText },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[rgb(var(--border))] bg-brand-blue px-4 py-6 text-white lg:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 font-display text-sm font-700">
          {getInitials(profile.nama)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{profile.nama}</p>
          <p className="truncate text-xs text-white/60">Administrator</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {menuAdmin.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-white text-brand-blue" : "text-white/75 hover:bg-white/10"
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-control px-3 py-2.5 text-sm text-white/75 hover:bg-white/10"
      >
        <ArrowLeftRight size={17} />
        Tampilan Saya
      </Link>
    </aside>
  );
}
