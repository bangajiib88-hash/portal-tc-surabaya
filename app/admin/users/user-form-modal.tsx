// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { createUser, updateUser } from "./actions";
import type { Profile } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  initial?: Profile;
  onClose: () => void;
};

const inputClass =
  "w-full rounded-control border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-blue";
const labelClass = "mb-1 block text-xs font-medium text-ink-soft";

export function UserFormModal({ mode, initial, onClose }: Props) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    nik: initial?.nik ?? "",
    nama: initial?.nama ?? "",
    jabatan: initial?.jabatan ?? "",
    kodeToko: initial?.kode_toko ?? "",
    namaToko: initial?.nama_toko ?? "",
    email: initial?.email ?? "",
    nomorWa: initial?.nomor_wa ?? "",
    role: initial?.role ?? "user",
    password: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createUser(form)
          : await updateUser(initial!.id, form);

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
            {mode === "create" ? "Tambah User Baru" : "Edit Data User"}
          </h2>
          <button onClick={onClose} className="text-ink-soft hover:text-brand-red">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>NIK</label>
              <input
                required
                value={form.nik}
                onChange={(e) => update("nik", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nama</label>
              <input
                required
                value={form.nama}
                onChange={(e) => update("nama", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Jabatan</label>
              <input
                value={form.jabatan}
                onChange={(e) => update("jabatan", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <select
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                className={inputClass}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Kode Toko</label>
              <input
                value={form.kodeToko}
                onChange={(e) => update("kodeToko", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nama Toko</label>
              <input
                value={form.namaToko}
                onChange={(e) => update("namaToko", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nomor WhatsApp</label>
              <input
                value={form.nomorWa}
                onChange={(e) => update("nomorWa", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {mode === "create" && (
            <div>
              <label className={labelClass}>Password Awal</label>
              <input
                type="text"
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Minimal 6 karakter"
                className={inputClass}
              />
            </div>
          )}

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
