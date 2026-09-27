// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { akunPintarSchema } from "@/lib/validations/akun-pintar";

type ActionResult = { success: boolean; message: string };

export async function simpanAkunPintar(
  emailPintar: string,
  passwordPintar: string
): Promise<ActionResult> {
  const parsed = akunPintarSchema.safeParse({ emailPintar, passwordPintar });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const key = process.env.AKUN_PINTAR_ENCRYPTION_KEY;
  if (!key) {
    return {
      success: false,
      message: "Konfigurasi enkripsi belum diatur. Hubungi admin.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Sesi Anda telah berakhir." };

  // Enkripsi password di sisi database (kunci tidak pernah dikirim ke client)
  const { data: encrypted, error: encryptError } = await supabase.rpc(
    "encrypt_akun_pintar",
    { plain: parsed.data.passwordPintar, key }
  );

  if (encryptError || !encrypted) {
    return { success: false, message: "Gagal mengenkripsi password." };
  }

  const { data: existing } = await supabase
    .from("akun_pintar")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const isUpdate = !!existing;

  const { error } = await supabase.from("akun_pintar").upsert(
    {
      user_id: user.id,
      email_pintar: parsed.data.emailPintar,
      password_pintar_enc: encrypted,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { success: false, message: "Gagal menyimpan data: " + error.message };
  }

  await supabase.from("audit_log").insert({
    actor_id: user.id,
    action: isUpdate ? "update" : "create",
    table_name: "akun_pintar",
    record_id: user.id,
    detail: { via: "self-service" },
  });

  revalidatePath("/akun-pintar");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: isUpdate
      ? "Data akun pintar berhasil diperbarui."
      : "Data akun pintar berhasil disimpan.",
  };
}
