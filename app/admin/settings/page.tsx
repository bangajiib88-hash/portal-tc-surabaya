// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["fonnte_token", "spreadsheet_url"]);

  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
  const token: string = map.fonnte_token ?? "";

  return (
    <>
      <Topbar title="Pengaturan" />
      <main className="flex-1 px-6 py-6">
        <div className="mx-auto max-w-xl">
          {/* Token lengkap sengaja tidak dikirim ke browser, hanya 4 karakter terakhir */}
          <SettingsForm
            spreadsheetUrlAwal={map.spreadsheet_url ?? ""}
            tokenTersimpan={token.length > 0}
            tokenAkhir={token.slice(-4)}
          />
        </div>
      </main>
    </>
  );
}
