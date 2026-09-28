// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { createTraining, updateTraining } from "./actions";
import type { TrainingWithCounts } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  initial?: TrainingWithCounts;
  onClose: () => void;
};

const inputClass =
  "w-full rounded-control border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-blue";
const labelClass = "mb-1 block text-xs font-medium text-ink-soft";

export function TrainingFormModal({ mode, initial, onClose }: Props) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    namaTraining: initial?.nama_training ?? "",
    tanggalTraining: initial?.tanggal_training ?? "",
    cabang: initial?.cabang ?? "",
    deskripsi: initial?.deskripsi ?? "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createTraining(form)
          : await updateTraining(initial!.id, form);

      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-surface p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-base font-700">
            {mode === "create" ? "Tambah Training Baru" : "Edit Training"}
          </h2>
          <button onClick={onClose} className="text-ink-soft hover:text-brand-red">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={labelClass}>Nama Training</label>
            <input
              required
              value={form.namaTraining}
              onChange={(e) => update("namaTraining", e.target.value)}
              className={inputClass}
              placeholder="Contoh: Onboarding Karyawan Baru"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tanggal Training</label>
              <input
                type="date"
                value={form.tanggalTraining}
                onChange={(e) => update("tanggalTraining", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Cabang</label>
              <input
                value={form.cabang}
                onChange={(e) => update("cabang", e.target.value)}
                className={inputClass}
                placeholder="Contoh: TC Surabaya Pusat"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Deskripsi</label>
            <textarea
              value={form.deskripsi}
              onChange={(e) => update("deskripsi", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full rounded-control bg-brand-blue py-2.5 text-sm font-semibold text-white transition hover:bg-brand-blue-deep disabled:opacity-60"
          >
            {pending ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>
    </div>
  );
}
