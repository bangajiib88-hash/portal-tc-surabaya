// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";

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

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { supabase, actorId } = await requireAdmin();

  const rows: { key: string; value: string }[] = [
    { key: "spreadsheet_url", value: parsed.data.spreadsheetUrl ?? "" },
  ];
  // Token hanya diperbarui kalau diisi. Kosong = biarkan token lama.
  if (parsed.data.fonnteToken) {
    rows.push({ key: "fonnte_token", value: parsed.data.fonnteToken });
  }

  const { error } = await supabase
    .from("app_settings")
    .upsert(rows, { onConflict: "key" });

  if (error) {
    return { success: false, message: "Gagal menyimpan pengaturan: " + error.message };
  }

  // Nilai token TIDAK dicatat ke audit log, hanya nama pengaturan yang diubah.
  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action: "update",
    table_name: "app_settings",
    record_id: rows.map((r) => r.key).join(","),
  });

  revalidatePath("/admin/settings");
  return { success: true, message: "Pengaturan berhasil disimpan." };
}

export async function removeFonnteToken(): Promise<ActionResult> {
  const { supabase, actorId } = await requireAdmin();

  const { error } = await supabase
    .from("app_settings")
    .delete()
    .eq("key", "fonnte_token");

  if (error) {
    return { success: false, message: "Gagal menghapus token: " + error.message };
  }

  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action: "delete",
    table_name: "app_settings",
    record_id: "fonnte_token",
  });

  revalidatePath("/admin/settings");
  return { success: true, message: "Token Fonnte berhasil dihapus." };
}
