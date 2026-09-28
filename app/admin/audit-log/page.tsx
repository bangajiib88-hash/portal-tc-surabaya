// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";

const PAGE_SIZE = 25;

const AKSI_LABEL: Record<string, { label: string; className: string }> = {
  create: { label: "Tambah", className: "bg-emerald-500/10 text-emerald-600" },
  update: { label: "Ubah", className: "bg-brand-blue/10 text-brand-blue" },
  delete: { label: "Hapus", className: "bg-brand-red/10 text-brand-red" },
};

const TABEL_LABEL: Record<string, string> = {
  profiles: "Data User",
  trainings: "Training",
  training_participants: "Peserta Training",
  attendance: "Absensi",
  akun_pintar: "Akun Pintar",
  app_settings: "Pengaturan",
};

type SearchParams = {
  page?: string;
  action?: string;
  table?: string;
  from?: string;
  to?: string;
};

type AuditRow = {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
  profiles: { nama: string; nik: string } | null;
};

function formatWaktu(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("audit_log")
    .select("id, action, table_name, record_id, detail, created_at, profiles(nama, nik)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (sp.action && AKSI_LABEL[sp.action]) query = query.eq("action", sp.action);
  if (sp.table && TABEL_LABEL[sp.table]) query = query.eq("table_name", sp.table);
  if (sp.from) query = query.gte("created_at", `${sp.from}T00:00:00+07:00`);
  if (sp.to) query = query.lte("created_at", `${sp.to}T23:59:59+07:00`);

  const { data, count } = await query;
  const rows = (data ?? []) as unknown as AuditRow[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (sp.action) params.set("action", sp.action);
    if (sp.table) params.set("table", sp.table);
    if (sp.from) params.set("from", sp.from);
    if (sp.to) params.set("to", sp.to);
    params.set("page", String(target));
    return `/admin/audit-log?${params.toString()}`;
  }

  const inputClass =
    "rounded-control border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-blue";

  return (
    <>
      <Topbar title="Log Aktivitas" />
      <main className="flex-1 space-y-4 px-6 py-6">
        <form
          method="get"
          className="flex flex-wrap items-end gap-3 rounded-card border border-[rgb(var(--border))] bg-surface p-4"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Aksi</label>
            <select name="action" defaultValue={sp.action ?? ""} className={inputClass}>
              <option value="">Semua</option>
              {Object.entries(AKSI_LABEL).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Data</label>
            <select name="table" defaultValue={sp.table ?? ""} className={inputClass}>
              <option value="">Semua</option>
              {Object.entries(TABEL_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Dari tanggal</label>
            <input type="date" name="from" defaultValue={sp.from ?? ""} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Sampai tanggal</label>
            <input type="date" name="to" defaultValue={sp.to ?? ""} className={inputClass} />
          </div>
          <button
            type="submit"
            className="rounded-control bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-deep"
          >
            Terapkan
          </button>
          <Link
            href="/admin/audit-log"
            className="rounded-control border border-[rgb(var(--border))] px-4 py-2 text-sm font-medium hover:border-brand-blue"
          >
            Reset
          </Link>
        </form>

        <div className="overflow-x-auto rounded-card border border-[rgb(var(--border))] bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[rgb(var(--border))] text-xs uppercase text-ink-soft">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Pelaku</th>
                <th className="px-4 py-3">Aksi</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-soft">
                    Tidak ada aktivitas yang cocok dengan filter.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const aksi = AKSI_LABEL[r.action] ?? {
                  label: r.action,
                  className: "bg-[rgb(var(--bg))] text-ink-soft",
                };
                return (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                      {formatWaktu(r.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.profiles?.nama ?? "-"}</p>
                      {r.profiles?.nik && (
                        <p className="text-xs text-ink-soft">{r.profiles.nik}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${aksi.className}`}
                      >
                        {aksi.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {TABEL_LABEL[r.table_name] ?? r.table_name}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-xs text-ink-soft">
                      {r.detail ? JSON.stringify(r.detail) : (r.record_id ?? "-")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm">
          <p className="text-ink-soft">
            Halaman {page} dari {totalPages} ({count ?? 0} aktivitas)
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="flex items-center gap-1 rounded-control border border-[rgb(var(--border))] px-3 py-1.5 hover:border-brand-blue"
              >
                <ChevronLeft size={14} /> Sebelumnya
              </Link>
            ) : (
              <span className="flex items-center gap-1 rounded-control border border-[rgb(var(--border))] px-3 py-1.5 opacity-40">
                <ChevronLeft size={14} /> Sebelumnya
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={pageHref(page + 1)}
                className="flex items-center gap-1 rounded-control border border-[rgb(var(--border))] px-3 py-1.5 hover:border-brand-blue"
              >
                Berikutnya <ChevronRight size={14} />
              </Link>
            ) : (
              <span className="flex items-center gap-1 rounded-control border border-[rgb(var(--border))] px-3 py-1.5 opacity-40">
                Berikutnya <ChevronRight size={14} />
              </span>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
