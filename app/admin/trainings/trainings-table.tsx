// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, Users } from "lucide-react";
import { deleteTraining } from "./actions";
import { TrainingFormModal } from "./training-form-modal";
import { formatTanggalIndo } from "@/lib/utils";
import type { TrainingWithCounts } from "@/lib/types";

export function TrainingsTable({ trainings }: { trainings: TrainingWithCounts[] }) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<
    { mode: "create" } | { mode: "edit"; training: TrainingWithCounts } | null
  >(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trainings;
    return trainings.filter(
      (t) =>
        t.nama_training.toLowerCase().includes(q) ||
        (t.cabang ?? "").toLowerCase().includes(q)
    );
  }, [trainings, query]);

  function handleDelete(training: TrainingWithCounts) {
    if (
      !window.confirm(
        `Hapus training "${training.nama_training}"? Semua data peserta dan absensi terkait akan ikut terhapus.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteTraining(training.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama training atau cabang..."
            className="w-full rounded-control border border-[rgb(var(--border))] bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-blue"
          />
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center justify-center gap-2 rounded-control bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-deep"
        >
          <Plus size={15} /> Tambah Training
        </button>
      </div>

      <div className="overflow-x-auto rounded-card border border-[rgb(var(--border))] bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[rgb(var(--border))] text-xs uppercase text-ink-soft">
            <tr>
              <th className="px-4 py-3">Nama Training</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Cabang</th>
              <th className="px-4 py-3 text-center">Peserta</th>
              <th className="px-4 py-3 text-center">Sudah Absen</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border))]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
                  Belum ada training. Klik &quot;Tambah Training&quot; untuk membuat
                  yang pertama.
                </td>
              </tr>
            )}
            {filtered.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-medium">{t.nama_training}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {t.tanggal_training ? formatTanggalIndo(t.tanggal_training) : "-"}
                </td>
                <td className="px-4 py-3 text-ink-soft">{t.cabang ?? "-"}</td>
                <td className="px-4 py-3 text-center">{t.participant_count}</td>
                <td className="px-4 py-3 text-center">{t.attendance_count}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/trainings/${t.id}`}
                      className="flex items-center gap-1.5 rounded-control border border-[rgb(var(--border))] px-2.5 py-1.5 text-xs font-medium hover:border-brand-blue"
                    >
                      <Users size={13} /> Peserta
                    </Link>
                    <button
                      onClick={() => setModal({ mode: "edit", training: t })}
                      className="rounded-control border border-[rgb(var(--border))] p-1.5 hover:border-brand-blue"
                      aria-label="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      disabled={pending}
                      className="rounded-control border border-[rgb(var(--border))] p-1.5 hover:border-brand-red disabled:opacity-50"
                      aria-label="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.mode === "create" && (
        <TrainingFormModal mode="create" onClose={() => setModal(null)} />
      )}
      {modal?.mode === "edit" && (
        <TrainingFormModal
          mode="edit"
          initial={modal.training}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
