// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { CheckCircle2, Pencil } from "lucide-react";
import { submitAbsensi, updateAbsensi } from "../actions";

type Props = {
  trainingId: string;
  namaTraining: string;
  nik: string;
  nama: string;
  kodeToko: string | null;
  namaToko: string | null;
  sudahAbsen: boolean;
  nomorWaAwal: string;
  waktuAbsen?: string;
};

const readOnlyField = (label: string, value: string | null) => (
  <div>
    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">
      {label}
    </label>
    <div className="rounded-control border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3.5 py-2.5 text-sm text-ink-soft">
      {value ?? "-"}
    </div>
  </div>
);

export function AttendanceForm({
  trainingId,
  namaTraining,
  nik,
  nama,
  kodeToko,
  namaToko,
  sudahAbsen,
  nomorWaAwal,
  waktuAbsen,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [nomorWa, setNomorWa] = useState(nomorWaAwal);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(sudahAbsen && !editMode);

  const isFormVisible = !sudahAbsen || editMode;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const action = sudahAbsen ? updateAbsensi : submitAbsensi;
      const result = await action(trainingId, nomorWa);
      if (result.success) {
        toast.success(result.message);
        setDone(true);
        setEditMode(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  if (done && !isFormVisible) {
    return (
      <div className="rounded-card border border-[rgb(var(--border))] bg-surface p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-emerald-500" size={40} />
        <p className="font-display text-base font-700">Anda sudah absen</p>
        <p className="mt-1 text-sm text-ink-soft">
          Tercatat hadir untuk {namaTraining}
          {waktuAbsen ? ` pada ${waktuAbsen}` : ""}.
        </p>
        <button
          onClick={() => setEditMode(true)}
          className="mx-auto mt-4 flex items-center gap-2 rounded-control border border-[rgb(var(--border))] px-4 py-2 text-sm font-medium hover:border-brand-blue"
        >
          <Pencil size={14} /> Edit Nomor WhatsApp
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-card border border-[rgb(var(--border))] bg-surface p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {readOnlyField("Jenis Training", namaTraining)}
        {readOnlyField("NIK", nik)}
        {readOnlyField("Nama", nama)}
        {readOnlyField("Kode Toko", kodeToko)}
        {readOnlyField("Nama Toko", namaToko)}
      </div>

      <div>
        <label htmlFor="nomorWa" className="mb-1.5 block text-sm font-medium">
          Nomor WhatsApp
        </label>
        <input
          id="nomorWa"
          required
          value={nomorWa}
          onChange={(e) => setNomorWa(e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="w-full rounded-control border border-[rgb(var(--border))] bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-brand-blue"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending || nomorWa.trim().length === 0}
          className="flex-1 rounded-control bg-brand-blue py-2.5 text-sm font-semibold text-white transition hover:bg-brand-blue-deep disabled:opacity-50"
        >
          {pending
            ? "Memproses..."
            : sudahAbsen
            ? "Simpan Perubahan"
            : "Konfirmasi & Absen"}
        </button>
        {editMode && (
          <button
            type="button"
            onClick={() => setEditMode(false)}
            className="rounded-control border border-[rgb(var(--border))] px-4 py-2.5 text-sm font-medium"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
