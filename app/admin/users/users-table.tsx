// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Search, Plus, Pencil, Power } from "lucide-react";
import { toggleActiveUser } from "./actions";
import { UserFormModal } from "./user-form-modal";
import type { Profile } from "@/lib/types";

export function UsersTable({ users }: { users: Profile[] }) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<
    { mode: "create" } | { mode: "edit"; user: Profile } | null
  >(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.nik.toLowerCase().includes(q) ||
        u.nama.toLowerCase().includes(q) ||
        (u.kode_toko ?? "").toLowerCase().includes(q)
    );
  }, [users, query]);

  function handleToggle(user: Profile) {
    startTransition(async () => {
      const result = await toggleActiveUser(user.id, !user.is_active);
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
            placeholder="Cari NIK, nama, atau kode toko..."
            className="w-full rounded-control border border-[rgb(var(--border))] bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-blue"
          />
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center justify-center gap-2 rounded-control bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-deep"
        >
          <Plus size={15} /> Tambah User
        </button>
      </div>

      <div className="overflow-x-auto rounded-card border border-[rgb(var(--border))] bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[rgb(var(--border))] text-xs uppercase text-ink-soft">
            <tr>
              <th className="px-4 py-3">NIK</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Toko</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border))]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
                  Tidak ada data.
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{u.nik}</td>
                <td className="px-4 py-3">{u.nama}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {u.nama_toko ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      u.role === "admin"
                        ? "rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-medium text-brand-blue"
                        : "rounded-full bg-[rgb(var(--bg))] px-2 py-0.5 text-xs font-medium text-ink-soft"
                    }
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      u.is_active
                        ? "text-xs font-medium text-emerald-600"
                        : "text-xs font-medium text-brand-red"
                    }
                  >
                    {u.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setModal({ mode: "edit", user: u })}
                      className="rounded-control border border-[rgb(var(--border))] p-1.5 hover:border-brand-blue"
                      aria-label="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleToggle(u)}
                      disabled={pending}
                      className="rounded-control border border-[rgb(var(--border))] p-1.5 hover:border-brand-red disabled:opacity-50"
                      aria-label={u.is_active ? "Nonaktifkan" : "Aktifkan"}
                    >
                      <Power size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.mode === "create" && (
        <UserFormModal mode="create" onClose={() => setModal(null)} />
      )}
      {modal?.mode === "edit" && (
        <UserFormModal
          mode="edit"
          initial={modal.user}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
