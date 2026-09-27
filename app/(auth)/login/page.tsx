// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    // 1. Cari email auth yang terkait dengan NIK ini
    const { data: email, error: lookupError } = await supabase.rpc(
      "get_auth_email_by_nik",
      { input_nik: nik.trim() }
    );

    if (lookupError || !email) {
      toast.error("NIK tidak terdaftar di sistem.");
      setLoading(false);
      return;
    }

    // 2. Login sesungguhnya dengan email hasil lookup + password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      toast.error("NIK atau kata sandi salah.");
      return;
    }

    toast.success("Berhasil masuk. Mengarahkan ke dashboard...");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* PANEL KIRI — identitas brand, disembunyikan di mobile */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-brand-blue p-12 text-white lg:flex">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-yellow/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-brand-red/10 blur-3xl"
        />

        <div className="relative z-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-control bg-white font-display text-lg font-800 text-brand-blue">
            TC
          </span>
          <span className="font-display text-lg font-700">Portal TC Surabaya</span>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="font-display text-3xl font-800 leading-tight">
            Satu portal, seluruh perjalanan pelatihan Anda.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/75">
            Absensi training, data akun Pintar, dan pengingat tim — terhubung
            dalam satu tempat, untuk seluruh karyawan Training Center
            Surabaya.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © 2026 Bang Ajiib. Seluruh hak cipta dilindungi.
        </p>
      </section>

      {/* PANEL KANAN — form login */}
      <section className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mb-8 flex items-center justify-between lg:hidden">
          <span className="font-display text-lg font-700 text-brand-blue">
            Portal TC Surabaya
          </span>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-800">Masuk</h1>
              <p className="mt-1 text-sm text-ink-soft">
                Gunakan NIK dan kata sandi Anda.
              </p>
            </div>
            <ThemeToggle />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="nik" className="mb-1.5 block text-sm font-medium">
                NIK
              </label>
              <input
                id="nik"
                required
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="Contoh: 2006008451"
                className="w-full rounded-control border border-[rgb(var(--border))] bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-control bg-brand-blue py-2.5 text-sm font-semibold text-white transition hover:bg-brand-blue-deep disabled:opacity-60"
            >
              {loading ? "Memeriksa..." : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-soft">
            Lupa kata sandi? Hubungi admin HRD toko Anda.
          </p>
        </div>
      </section>
    </main>
  );
}
