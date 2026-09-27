// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { absensiSchema } from "@/lib/validations/absensi";

type ActionResult = { success: boolean; message: string };

async function catatAudit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string,
  action: "create" | "update",
  recordId: string
) {
  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action,
    table_name: "attendance",
    record_id: recordId,
    detail: { via: "self-service" },
  });
}

export async function submitAbsensi(
  trainingId: string,
  nomorWa: string
): Promise<ActionResult> {
  const parsed = absensiSchema.safeParse({ trainingId, nomorWa });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Sesi Anda telah berakhir." };

  // Pastikan user memang terdaftar sebagai peserta training ini —
  // pengecekan ganda di sini + RLS di database (defense in depth).
  const { data: participant } = await supabase
    .from("training_participants")
    .select("id")
    .eq("training_id", trainingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!participant) {
    return {
      success: false,
      message: "Anda bukan peserta terdaftar untuk training ini.",
    };
  }

  const { data: inserted, error } = await supabase
    .from("attendance")
    .insert({
      training_id: trainingId,
      user_id: user.id,
      nomor_wa: parsed.data.nomorWa,
      status: "Hadir",
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, message: "Gagal mencatat absensi: " + error.message };
  }

  await catatAudit(supabase, user.id, "create", inserted.id);
  revalidatePath(`/absensi/${trainingId}`);

  return { success: true, message: "Absensi Anda berhasil tercatat." };
}

export async function updateAbsensi(
  trainingId: string,
  nomorWa: string
): Promise<ActionResult> {
  const parsed = absensiSchema.safeParse({ trainingId, nomorWa });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Sesi Anda telah berakhir." };

  const { error } = await supabase
    .from("attendance")
    .update({ nomor_wa: parsed.data.nomorWa })
    .eq("training_id", trainingId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: "Gagal memperbarui data: " + error.message };
  }

  await catatAudit(supabase, user.id, "update", trainingId);
  revalidatePath(`/absensi/${trainingId}`);

  return { success: true, message: "Data absensi berhasil diperbarui." };
}
