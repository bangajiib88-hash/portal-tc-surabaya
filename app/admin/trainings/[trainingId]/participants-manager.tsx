// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Search, UserPlus, Trash2, CheckCircle2 } from "lucide-react";
import { addParticipants, removeParticipant } from "../actions";
import type { Profile, TrainingParticipantRow } from "@/lib/types";

type Props = {
  trainingId: string;
  participants: TrainingParticipantRow[];
  availableUsers: Profile[];
};

export function ParticipantsManager({ trainingId, participants, availableUsers }: Props) {
  const [queryPeserta, setQueryPeserta] = useState("");
  const [queryTambah, setQueryTambah] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const filteredParticipants = useMemo(() => {
    const q = queryPeserta.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter(
      (p) =>
        p.nama.toLowerCase().includes(q) ||
        p.nik.toLowerCase().includes(q) ||
        (p.kode_toko ?? "").toLowerCase().includes(q)
    );
  }, [participants, queryPeserta]);

  const filteredAvailable = useMemo(() => {
    const q = queryTambah.trim().toLowerCase();
    if (!q) return availableUsers;
    return availableUsers.filter(
      (u) =>
        u.nama.toLowerCase().includes(q) ||
        u.nik.toLowerCase().includes(q) ||
        (u.kode_toko ?? "").toLowerCase().includes(q)
    );
  }, [availableUsers, queryTambah]);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    if (selected.size === 0) return;
    startTransition(async () => {
      const result = await addParticipants(trainingId, Array.from(selected));
      if (result.success) {
        toast.success(result.message);
        setSelected(new Set());
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleRemove(p: TrainingParticipantRow) {
    if (
      p.sudah_absen &&
      !window.confirm(
        `${p.nama} sudah tercatat absen di training ini. Hapus tetap dari daftar peserta? Data absensinya tidak akan ikut terhapus.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await removeParticipant(trainingId, p.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <div>
      <Link
        href="/admin/trainings"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-blue"
      >
        <ArrowLeft size={15} /> Kembali ke Daftar Training
      </Link>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* PESERTA TERDAFTAR */}
        <div className="rounded-card border border-[rgb(var(--border))] bg-surface p-5">
          <h2 className="mb-4 font-display text-sm font-700">
            Peserta Terdaftar ({participants.length})
          </h2>

          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              value={queryPeserta}
              onChange={(e) => setQueryPeserta(e.target.value)}
              placeholder="Cari peserta terdaftar..."
              className="w-full rounded-control border border-[rgb(var(--border))] bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-[rgb(var(--border))] bg-surface text-xs uppercase text-ink-soft">
                <tr>
                  <th className="py-2 pr-2">Nama</th>
                  <th className="py-2 pr-2">Toko</th>
                  <th className="py-2 pr-2 text-center">Status</th>
                  <th className="py-2 pr-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {filteredParticipants.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-ink-soft">
                      Belum ada peserta terdaftar.
                    </td>
                  </tr>
                )}
                {filteredParticipants.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 pr-2">
                      <p className="font-medium">{p.nama}</p>
                      <p className="text-xs text-ink-soft">{p.nik}</p>
                    </td>
                    <td className="py-2.5 pr-2 text-ink-soft">{p.nama_toko ?? "-"}</td>
                    <td className="py-2.5 pr-2 text-center">
                      {p.sudah_absen ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                          <CheckCircle2 size={12} /> Hadir
                        </span>
                      ) : (
                        <span className="rounded-full bg-[rgb(var(--bg))] px-2 py-0.5 text-xs font-medium text-ink-soft">
                          Belum absen
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-2 text-center">
                      <button
                        onClick={() => handleRemove(p)}
                        disabled={pending}
                        className="rounded-control border border-[rgb(var(--border))] p-1.5 hover:border-brand-red disabled:opacity-50"
                        aria-label="Hapus dari training"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TAMBAH PESERTA */}
        <div className="rounded-card border border-[rgb(var(--border))] bg-surface p-5">
          <h2 className="mb-4 font-display text-sm font-700">Tambah Peserta</h2>

          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              value={queryTambah}
              onChange={(e) => setQueryTambah(e.target.value)}
              placeholder="Cari nama, NIK, atau kode toko..."
              className="w-full rounded-control border border-[rgb(var(--border))] bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          <div className="max-h-[380px] space-y-1 overflow-y-auto">
            {filteredAvailable.length === 0 && (
              <p className="py-8 text-center text-sm text-ink-soft">
                {availableUsers.length === 0
                  ? "Semua user aktif sudah menjadi peserta."
                  : "Tidak ada user yang cocok."}
              </p>
            )}
            {filteredAvailable.map((u) => (
              <label
                key={u.id}
                className="flex cursor-pointer items-center gap-3 rounded-control px-2 py-2 text-sm hover:bg-[rgb(var(--bg))]"
              >
                <input
                  type="checkbox"
                  checked={selected.has(u.id)}
                  onChange={() => toggleSelected(u.id)}
                  className="h-4 w-4 accent-brand-blue"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{u.nama}</p>
                  <p className="truncate text-xs text-ink-soft">
                    {u.nik} {u.nama_toko ? `• ${u.nama_toko}` : ""}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleAdd}
            disabled={pending || selected.size === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-control bg-brand-blue py-2.5 text-sm font-semibold text-white transition hover:bg-brand-blue-deep disabled:opacity-50"
          >
            <UserPlus size={15} />
            {pending
              ? "Menambahkan..."
              : selected.size > 0
              ? `Tambah ${selected.size} Peserta`
              : "Pilih Peserta"}
          </button>
        </div>
      </div>
    </div>
  );
}
