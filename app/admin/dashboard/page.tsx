// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import { Users, GraduationCap, ClipboardCheck, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { LiveFeed } from "@/components/features/admin-monitoring/live-feed";

async function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-card border border-[rgb(var(--border))] bg-surface p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-control bg-brand-blue/10 text-brand-blue">
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-ink-soft">{label}</p>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalTrainings },
    { count: attendanceToday },
    { count: totalAkunPintar },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("trainings").select("*", { count: "exact", head: true }),
    supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .gte("waktu_absen", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase.from("akun_pintar").select("*", { count: "exact", head: true }),
  ]);

  const { data: recentAttendanceRaw } = await supabase
    .from("attendance")
    .select("id, nomor_wa, waktu_absen, trainings(nama_training), profiles(nama)")
    .order("waktu_absen", { ascending: false })
    .limit(8);

  const { data: recentAudit } = await supabase
    .from("audit_log")
    .select("id, action, table_name, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const recentAttendance = (recentAttendanceRaw ?? []).map((r) => ({
    id: r.id,
    nama_training:
      (r.trainings as unknown as { nama_training: string } | null)
        ?.nama_training ?? "-",
    nama: (r.profiles as unknown as { nama: string } | null)?.nama ?? "-",
    nomor_wa: r.nomor_wa,
    waktu_absen: r.waktu_absen,
  }));

  return (
    <>
      <Topbar title="Dashboard Admin" />
      <main className="flex-1 space-y-6 px-6 py-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Users} label="Total User" value={totalUsers ?? 0} />
          <StatCard
            icon={GraduationCap}
            label="Jenis Training"
            value={totalTrainings ?? 0}
          />
          <StatCard
            icon={ClipboardCheck}
            label="Absensi Hari Ini"
            value={attendanceToday ?? 0}
          />
          <StatCard
            icon={KeyRound}
            label="Akun Pintar Terisi"
            value={totalAkunPintar ?? 0}
          />
        </div>

        <LiveFeed
          initialAttendance={recentAttendance}
          initialAudit={recentAudit ?? []}
        />
      </main>
    </>
  );
}
