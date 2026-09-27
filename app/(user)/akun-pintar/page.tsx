// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { AkunPintarForm } from "./akun-pintar-form";

export default async function AkunPintarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: akunPintar } = await supabase
    .from("akun_pintar")
    .select("email_pintar, password_pintar_enc")
    .eq("user_id", user!.id)
    .maybeSingle();

  let passwordPintar = "";
  if (akunPintar?.password_pintar_enc) {
    const { data: decrypted } = await supabase.rpc("decrypt_akun_pintar", {
      cipher: akunPintar.password_pintar_enc,
      key: process.env.AKUN_PINTAR_ENCRYPTION_KEY!,
    });
    passwordPintar = decrypted ?? "";
  }

  return (
    <>
      <Topbar title="Akun Pintar" />
      <main className="flex-1 px-6 py-6">
        <div className="mx-auto max-w-lg">
          <AkunPintarForm
            emailAwal={akunPintar?.email_pintar ?? ""}
            passwordAwal={passwordPintar}
            sudahAda={!!akunPintar}
          />
        </div>
      </main>
    </>
  );
}
