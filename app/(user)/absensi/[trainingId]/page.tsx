// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import { notFound } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { AttendanceForm } from "./attendance-form";
import type { Profile } from "@/lib/types";

export default async function AbsensiDetailPage({
  params,
}: {
  params: Promise<{ trainingId: string }>;
}) {
  const { trainingId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // middleware sudah menangani redirect

  const { data: training } = await supabase
    .from("trainings")
    .select("id, nama_training")
    .eq("id", trainingId)
    .single();

  if (!training) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  // 1. Apakah user terdaftar sebagai peserta training ini?
  const { data: participant } = await supabase
    .from("training_participants")
    .select("id")
    .eq("training_id", trainingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!participant) {
    return (
      <>
        <Topbar title={training.nama_training} />
        <main className="flex-1 px-6 py-6">
          <div className="mx-auto max-w-md rounded-card border border-[rgb(var(--border))] bg-surface p-8 text-center">
            <ShieldAlert className="mx-auto mb-3 text-brand-red" size={40} />
            <p className="font-display text-base font-700">
              Anda Bukan Peserta Training Ini
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              NIK {profile?.nik} tidak terdaftar sebagai peserta untuk{" "}
              {training.nama_training}. Hubungi admin HRD jika Anda merasa ini
              keliru.
            </p>
          </div>
        </main>
      </>
    );
  }

  // 2. Apakah sudah pernah absen?
  const { data: attendance } = await supabase
    .from("attendance")
    .select("nomor_wa, waktu_absen")
    .eq("training_id", trainingId)
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <>
      <Topbar title={training.nama_training} />
      <main className="flex-1 px-6 py-6">
        <div className="mx-auto max-w-lg">
          <AttendanceForm
            trainingId={trainingId}
            namaTraining={training.nama_training}
            nik={profile!.nik}
            nama={profile!.nama}
            kodeToko={profile!.kode_toko}
            namaToko={profile!.nama_toko}
            sudahAbsen={!!attendance}
            nomorWaAwal={attendance?.nomor_wa ?? profile!.nomor_wa ?? ""}
            waktuAbsen={
              attendance?.waktu_absen
                ? new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(attendance.waktu_absen))
                : undefined
            }
          />
        </div>
      </main>
    </>
  );
}
