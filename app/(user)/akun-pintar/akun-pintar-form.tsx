// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Pencil, KeyRound } from "lucide-react";
import { simpanAkunPintar } from "./actions";

type Props = {
  emailAwal: string;
  passwordAwal: string;
  sudahAda: boolean;
};

export function AkunPintarForm({ emailAwal, passwordAwal, sudahAda }: Props) {
  const [editMode, setEditMode] = useState(!sudahAda);
  const [email, setEmail] = useState(emailAwal);
  const [password, setPassword] = useState(passwordAwal);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await simpanAkunPintar(email, password);
      if (result.success) {
        toast.success(result.message);
        setEditMode(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  if (!editMode) {
    return (
      <div className="rounded-card border border-[rgb(var(--border))] bg-surface p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-blue/10 text-brand-blue">
            <KeyRound size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold">Akun Pintar Anda</p>
            <p className="text-xs text-ink-soft">
              Data ini dipakai untuk login ke aplikasi PINTAR.
            </p>
          </div>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              Email Pintar
            </dt>
            <dd className="mt-0.5 text-sm">{email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              Password Pintar
            </dt>
            <dd className="mt-0.5 flex items-center gap-2 text-sm tabular-nums">
              {showPassword ? password : "•".repeat(Math.min(password.length, 14))}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Sembunyikan" : "Lihat"}
                className="text-ink-soft transition hover:text-brand-blue"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </dd>
          </div>
        </dl>

        <button
          onClick={() => setEditMode(true)}
          className="mt-5 flex items-center gap-2 rounded-control border border-[rgb(var(--border))] px-4 py-2 text-sm font-medium hover:border-brand-blue"
        >
          <Pencil size={14} /> Edit Data
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-card border border-[rgb(var(--border))] bg-surface p-6"
    >
      <p className="text-sm font-semibold">
        {sudahAda ? "Edit Akun Pintar" : "Isi Data Akun Pintar"}
      </p>
      <p className="text-xs text-ink-soft">
        Pastikan email dan password sesuai dengan akun PINTAR Anda untuk
        meminimalisir salah ketik.
      </p>

      <div>
        <label htmlFor="emailPintar" className="mb-1.5 block text-sm font-medium">
          Email Pintar
        </label>
        <input
          id="emailPintar"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@pintar.email"
          className="w-full rounded-control border border-[rgb(var(--border))] bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-brand-blue"
        />
      </div>

      <div>
        <label htmlFor="passwordPintar" className="mb-1.5 block text-sm font-medium">
          Password Pintar
        </label>
        <div className="relative">
          <input
            id="passwordPintar"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-control border border-[rgb(var(--border))] bg-transparent px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-brand-blue"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft"
          >
            {showPassword ? "Sembunyikan" : "Lihat"}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-control bg-brand-blue py-2.5 text-sm font-semibold text-white transition hover:bg-brand-blue-deep disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan Data"}
        </button>
        {sudahAda && (
          <button
            type="button"
            onClick={() => {
              setEditMode(false);
              setEmail(emailAwal);
              setPassword(passwordAwal);
            }}
            className="rounded-control border border-[rgb(var(--border))] px-4 py-2.5 text-sm font-medium"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
