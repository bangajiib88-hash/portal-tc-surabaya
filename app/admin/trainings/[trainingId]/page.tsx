// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { ParticipantsManager } from "./participants-manager";
import type { Profile, TrainingParticipantRow } from "@/lib/types";

export default async function TrainingParticipantsPage({
  params,
}: {
  params: Promise<{ trainingId: string }>;
}) {
  const { trainingId } = await params;
  const supabase = await createClient();

  const { data: training } = await supabase
    .from("trainings")
    .select("id, nama_training, tanggal_training, cabang")
    .eq("id", trainingId)
    .single();

  if (!training) notFound();

  const [{ data: participantsRaw }, { data: attendanceRows }, { data: allUsers }] =
    await Promise.all([
      supabase
        .from("training_participants")
        .select("id, user_id, profiles(nik, nama, kode_toko, nama_toko, is_active)")
        .eq("training_id", trainingId),
      supabase.from("attendance").select("user_id").eq("training_id", trainingId),
      supabase
        .from("profiles")
        .select("id, nik, nama, jabatan, kode_toko, nama_toko, email, nomor_wa, foto_url, role, is_active")
        .order("nama", { ascending: true })
        .returns<Profile[]>(),
    ]);

  const attendedIds = new Set((attendanceRows ?? []).map((a) => a.user_id));

  const participants: TrainingParticipantRow[] = (participantsRaw ?? []).map((p) => {
    const profile = p.profiles as unknown as {
      nik: string;
      nama: string;
      kode_toko: string | null;
      nama_toko: string | null;
      is_active: boolean;
    } | null;
    return {
      id: p.id,
      user_id: p.user_id,
      nik: profile?.nik ?? "-",
      nama: profile?.nama ?? "(user dihapus)",
      kode_toko: profile?.kode_toko ?? null,
      nama_toko: profile?.nama_toko ?? null,
      sudah_absen: attendedIds.has(p.user_id),
    };
  });

  const participantUserIds = new Set(participants.map((p) => p.user_id));
  const availableUsers = (allUsers ?? []).filter(
    (u) => u.is_active && !participantUserIds.has(u.id)
  );

  return (
    <>
      <Topbar title={`Peserta • ${training.nama_training}`} />
      <main className="flex-1 px-6 py-6">
        <ParticipantsManager
          trainingId={trainingId}
          participants={participants}
          availableUsers={availableUsers}
        />
      </main>
    </>
  );
}
