// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import type { Profile } from "@/lib/types";

const fields: { label: string; key: keyof Profile }[] = [
  { label: "NIK", key: "nik" },
  { label: "Nama", key: "nama" },
  { label: "Jabatan", key: "jabatan" },
  { label: "Kode Toko", key: "kode_toko" },
  { label: "Nama Toko", key: "nama_toko" },
  { label: "Email", key: "email" },
  { label: "Nomor WhatsApp", key: "nomor_wa" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  const { data: akunPintar } = await supabase
    .from("akun_pintar")
    .select("email_pintar")
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <>
      <Topbar title="Dashboard" />
      <main className="flex-1 px-6 py-6">
        <div className="mb-6 rounded-card bg-brand-blue px-6 py-5 text-white">
          <p className="font-display text-lg font-700">
            Selamat datang, {profile?.nama ?? "-"}
          </p>
          <p className="mt-1 text-sm text-white/75">
            Berikut ringkasan data kepegawaian Anda di Portal TC Surabaya.
          </p>
        </div>

        <div className="rounded-card border border-[rgb(var(--border))] bg-surface">
          <div className="border-b border-[rgb(var(--border))] px-5 py-3">
            <h2 className="text-sm font-semibold">Data Diri</h2>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key}>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                  {f.label}
                </dt>
                <dd className="mt-0.5 text-sm">{profile?.[f.key] ?? "-"}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Email Pintar
              </dt>
              <dd className="mt-0.5 text-sm">
                {akunPintar?.email_pintar ?? (
                  <span className="text-ink-soft">Belum diisi</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </>
  );
}
