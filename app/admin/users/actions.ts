// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createUserSchema, userSchema, type CreateUserInput, type UserInput } from "@/lib/validations/user";

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

export async function createUser(input: CreateUserInput): Promise<ActionResult> {
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { supabase, actorId } = await requireAdmin();
  const admin = createAdminClient();

  // 1. Buat akun auth lewat Admin API (butuh service role key, aman karena
  //    hanya dipanggil dari Server Action setelah requireAdmin() lolos)
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (authError || !created.user) {
    return {
      success: false,
      message: "Gagal membuat akun: " + (authError?.message ?? "unknown error"),
    };
  }

  // 2. Isi data profil
  const { error: profileError } = await supabase.from("profiles").insert({
    id: created.user.id,
    nik: parsed.data.nik,
    nama: parsed.data.nama,
    jabatan: parsed.data.jabatan || null,
    kode_toko: parsed.data.kodeToko || null,
    nama_toko: parsed.data.namaToko || null,
    email: parsed.data.email,
    nomor_wa: parsed.data.nomorWa || null,
    role: parsed.data.role,
  });

  if (profileError) {
    // Rollback akun auth supaya tidak jadi akun "yatim" tanpa profil
    await admin.auth.admin.deleteUser(created.user.id);
    return {
      success: false,
      message: "Gagal menyimpan profil: " + profileError.message,
    };
  }

  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action: "create",
    table_name: "profiles",
    record_id: created.user.id,
    detail: { nik: parsed.data.nik },
  });

  revalidatePath("/admin/users");
  return { success: true, message: "User baru berhasil dibuat." };
}

export async function updateUser(
  userId: string,
  input: UserInput
): Promise<ActionResult> {
  const parsed = userSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { supabase, actorId } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({
      nik: parsed.data.nik,
      nama: parsed.data.nama,
      jabatan: parsed.data.jabatan || null,
      kode_toko: parsed.data.kodeToko || null,
      nama_toko: parsed.data.namaToko || null,
      email: parsed.data.email,
      nomor_wa: parsed.data.nomorWa || null,
      role: parsed.data.role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { success: false, message: "Gagal memperbarui data: " + error.message };
  }

  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action: "update",
    table_name: "profiles",
    record_id: userId,
  });

  revalidatePath("/admin/users");
  return { success: true, message: "Data user berhasil diperbarui." };
}

export async function toggleActiveUser(
  userId: string,
  isActive: boolean
): Promise<ActionResult> {
  const { supabase, actorId } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) {
    return { success: false, message: "Gagal mengubah status: " + error.message };
  }

  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action: "update",
    table_name: "profiles",
    record_id: userId,
    detail: { is_active: isActive },
  });

  revalidatePath("/admin/users");
  return {
    success: true,
    message: isActive ? "User diaktifkan kembali." : "User dinonaktifkan.",
  };
}
