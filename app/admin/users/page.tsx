// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { UsersTable } from "./users-table";
import type { Profile } from "@/lib/types";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Profile[]>();

  return (
    <>
      <Topbar title="Data User" />
      <main className="flex-1 px-6 py-6">
        <UsersTable users={users ?? []} />
      </main>
    </>
  );
}
