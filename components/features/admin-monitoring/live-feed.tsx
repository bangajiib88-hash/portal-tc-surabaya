// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import { useEffect, useState } from "react";
import { Radio, CheckCircle2, Pencil, Trash2, PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AttendanceRow = {
  id: string;
  nama_training: string;
  nama: string;
  nomor_wa: string;
  waktu_absen: string;
};

type AuditRow = {
  id: string;
  action: "create" | "update" | "delete";
  table_name: string;
  created_at: string;
};

const actionIcon = {
  create: PlusCircle,
  update: Pencil,
  delete: Trash2,
};

const actionLabel = {
  create: "Tambah data",
  update: "Ubah data",
  delete: "Hapus data",
};

export function LiveFeed({
  initialAttendance,
  initialAudit,
}: {
  initialAttendance: AttendanceRow[];
  initialAudit: AuditRow[];
}) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [audit, setAudit] = useState(initialAudit);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-live-monitoring")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendance" },
        (payload) => {
          const row = payload.new as {
            id: string;
            nomor_wa: string;
            waktu_absen: string;
          };
          setAttendance((prev) => [
            {
              id: row.id,
              nama_training: "Training",
              nama: "Peserta",
              nomor_wa: row.nomor_wa,
              waktu_absen: row.waktu_absen,
            },
            ...prev,
          ].slice(0, 8));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "audit_log" },
        (payload) => {
          const row = payload.new as AuditRow;
          setAudit((prev) => [row, ...prev].slice(0, 8));
        }
      )
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-card border border-[rgb(var(--border))] bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Absensi Masuk</h3>
          <StatusBadge connected={connected} />
        </div>
        <ul className="space-y-3">
          {attendance.length === 0 && (
            <li className="text-sm text-ink-soft">Belum ada absensi.</li>
          )}
          {attendance.map((a) => (
            <li key={a.id} className="flex items-start gap-3 text-sm">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-medium">{a.nama}</p>
                <p className="text-xs text-ink-soft">
                  {a.nama_training} • {a.nomor_wa} •{" "}
                  {new Date(a.waktu_absen).toLocaleTimeString("id-ID")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-card border border-[rgb(var(--border))] bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Aktivitas Sistem</h3>
          <StatusBadge connected={connected} />
        </div>
        <ul className="space-y-3">
          {audit.length === 0 && (
            <li className="text-sm text-ink-soft">Belum ada aktivitas.</li>
          )}
          {audit.map((a) => {
            const Icon = actionIcon[a.action];
            return (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <Icon size={16} className="mt-0.5 shrink-0 text-brand-blue" />
                <div>
                  <p className="font-medium">
                    {actionLabel[a.action]} — {a.table_name}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {new Date(a.created_at).toLocaleTimeString("id-ID")}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-ink-soft">
      <Radio size={12} className={connected ? "text-emerald-500" : "text-ink-soft"} />
      {connected ? "Live" : "Menghubungkan..."}
    </span>
  );
}
