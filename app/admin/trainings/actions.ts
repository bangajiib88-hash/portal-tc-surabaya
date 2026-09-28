// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  trainingSchema,
  addParticipantsSchema,
  type TrainingInput,
} from "@/lib/validations/training";

type ActionResult = { success: boolean; message: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi berakhir");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Akses ditolak");
  return { supabase, actorId: user.id };
}

export async function createTraining(input: TrainingInput): Promise<ActionResult> {
  const parsed = trainingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { supabase, actorId } = await requireAdmin();

  const { data: inserted, error } = await supabase
    .from("trainings")
    .insert({
      nama_training: parsed.data.namaTraining,
      tanggal_training: parsed.data.tanggalTraining || null,
      cabang: parsed.data.cabang || null,
      deskripsi: parsed.data.deskripsi || null,
      created_by: actorId,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, message: "Gagal membuat training: " + error.message };
  }

  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action: "create",
    table_name: "trainings",
    record_id: inserted.id,
    detail: { nama_training: parsed.data.namaTraining },
  });

  revalidatePath("/admin/trainings");
  return { success: true, message: "Training baru berhasil dibuat." };
}

export async function updateTraining(
  trainingId: string,
  input: TrainingInput
): Promise<ActionResult> {
  const parsed = trainingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { supabase, actorId } = await requireAdmin();

  const { error } = await supabase
    .from("trainings")
    .update({
      nama_training: parsed.data.namaTraining,
      tanggal_training: parsed.data.tanggalTraining || null,
      cabang: parsed.data.cabang || null,
      deskripsi: parsed.data.deskripsi || null,
    })
    .eq("id", trainingId);

  if (error) {
    return { success: false, message: "Gagal memperbarui training: " + error.message };
  }

  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action: "update",
    table_name: "trainings",
    record_id: trainingId,
  });

  revalidatePath("/admin/trainings");
  revalidatePath(`/admin/trainings/${trainingId}`);
  return { success: true, message: "Training berhasil diperbarui." };
}

export async function deleteTraining(trainingId: string): Promise<ActionResult> {
  const { supabase, actorId } = await requireAdmin();

  const { error } = await supabase.from("trainings").delete().eq("id", trainingId);

  if (error) {
    return { success: false, message: "Gagal menghapus training: " + error.message };
  }

  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action: "delete",
    table_name: "trainings",
    record_id: trainingId,
  });

  revalidatePath("/admin/trainings");
  return { success: true, message: "Training berhasil dihapus." };
}

// Tambah banyak peserta sekaligus. Duplikat (user yang sudah terdaftar)
// otomatis dilewati lewat unique constraint (training_id, user_id) +
// ignoreDuplicates, jadi aman dipanggil berkali-kali.
export async function addParticipants(
  trainingId: string,
  userIds: string[]
): Promise<ActionResult> {
  const parsed = addParticipantsSchema.safeParse({ userIds });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { supabase, actorId } = await requireAdmin();

  const rows = parsed.data.userIds.map((userId) => ({
    training_id: trainingId,
    user_id: userId,
  }));

  const { error } = await supabase
    .from("training_participants")
    .upsert(rows, { onConflict: "training_id,user_id", ignoreDuplicates: true });

  if (error) {
    return { success: false, message: "Gagal menambahkan peserta: " + error.message };
  }

  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action: "create",
    table_name: "training_participants",
    record_id: trainingId,
    detail: { jumlah_diproses: rows.length },
  });

  revalidatePath(`/admin/trainings/${trainingId}`);
  revalidatePath("/admin/trainings");
  return {
    success: true,
    message: `${rows.length} peserta diproses. Yang sudah terdaftar sebelumnya otomatis dilewati.`,
  };
}

export async function removeParticipant(
  trainingId: string,
  participantId: string
): Promise<ActionResult> {
  const { supabase, actorId } = await requireAdmin();

  const { error } = await supabase
    .from("training_participants")
    .delete()
    .eq("id", participantId);

  if (error) {
    return { success: false, message: "Gagal menghapus peserta: " + error.message };
  }

  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action: "delete",
    table_name: "training_participants",
    record_id: participantId,
  });

  revalidatePath(`/admin/trainings/${trainingId}`);
  revalidatePath("/admin/trainings");
  return { success: true, message: "Peserta berhasil dihapus dari training." };
}
