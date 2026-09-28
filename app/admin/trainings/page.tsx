// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { TrainingsTable } from "./trainings-table";
import type { TrainingWithCounts } from "@/lib/types";

export default async function TrainingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trainings")
    .select(
      "id, nama_training, tanggal_training, cabang, deskripsi, created_at, training_participants(count), attendance(count)"
    )
    .order("tanggal_training", { ascending: false, nullsFirst: false });

  const trainings: TrainingWithCounts[] = (data ?? []).map((t) => ({
    id: t.id,
    nama_training: t.nama_training,
    tanggal_training: t.tanggal_training,
    cabang: t.cabang,
    deskripsi: t.deskripsi,
    created_at: t.created_at,
    participant_count:
      (t.training_participants as unknown as { count: number }[])?.[0]?.count ?? 0,
    attendance_count:
      (t.attendance as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));

  return (
    <>
      <Topbar title="Training" />
      <main className="flex-1 px-6 py-6">
        <TrainingsTable trainings={trainings} />
      </main>
    </>
  );
}
