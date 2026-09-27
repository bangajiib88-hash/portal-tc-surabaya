// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { formatTanggalIndo } from "@/lib/utils";

export default async function AbsensiPage() {
  const supabase = await createClient();
  const { data: trainings } = await supabase
    .from("trainings")
    .select("id, nama_training, tanggal_training, cabang")
    .order("tanggal_training", { ascending: false });

  return (
    <>
      <Topbar title="Absensi Training" />
      <main className="flex-1 px-6 py-6">
        <p className="mb-5 text-sm text-ink-soft">
          Pilih jenis training yang sedang Anda ikuti hari ini.
        </p>

        {!trainings || trainings.length === 0 ? (
          <div className="rounded-card border border-dashed border-[rgb(var(--border))] p-8 text-center text-sm text-ink-soft">
            Belum ada jenis training yang tersedia. Hubungi admin HRD.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {trainings.map((t) => (
              <Link
                key={t.id}
                href={`/absensi/${t.id}`}
                className="group flex items-center justify-between rounded-card border border-[rgb(var(--border))] bg-surface p-4 transition hover:border-brand-blue"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-blue/10 text-brand-blue">
                    <CalendarDays size={17} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t.nama_training}</p>
                    {t.tanggal_training && (
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {formatTanggalIndo(t.tanggal_training)}
                      </p>
                    )}
                    {t.cabang && (
                      <p className="text-xs text-ink-soft">{t.cabang}</p>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="shrink-0 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-brand-blue"
                />
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
