-- ============================================================
-- PORTAL TC SURABAYA — SKEMA DATABASE (Supabase / PostgreSQL)
-- Dibuat oleh: Bang Ajiib (2026)
-- ============================================================
-- Jalankan file ini di Supabase SQL Editor pada project baru.
-- Urutan sudah memperhatikan foreign key dependency.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. PROFILES — memperluas auth.users bawaan Supabase
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nik text unique not null,
  nama text not null,
  jabatan text,
  kode_toko text,
  nama_toko text,
  email text,
  nomor_wa text,
  foto_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_kode_toko on profiles(kode_toko);
create index idx_profiles_role on profiles(role);

-- ------------------------------------------------------------
-- 2. STORES — struktur toko/cabang (future-proof: grouping wilayah)
-- ------------------------------------------------------------
create table stores (
  id uuid primary key default gen_random_uuid(),
  kode_toko text unique not null,
  nama_toko text not null,
  wilayah text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. AKUN PINTAR — password terenkripsi via pgcrypto (bukan plain text)
-- ------------------------------------------------------------
create table akun_pintar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references profiles(id) on delete cascade,
  email_pintar text not null,
  password_pintar_enc bytea not null, -- disimpan terenkripsi, lihat fungsi di bawah
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id)
);

-- Fungsi bantu enkripsi/dekripsi (kunci diambil dari env var Supabase Vault,
-- jangan hardcode kunci di kode aplikasi)
create or replace function encrypt_akun_pintar(plain text, key text)
returns bytea language sql as $$
  select pgp_sym_encrypt(plain, key);
$$;

create or replace function decrypt_akun_pintar(cipher bytea, key text)
returns text language sql as $$
  select pgp_sym_decrypt(cipher, key);
$$;

-- ------------------------------------------------------------
-- 4. TRAININGS — jenis/sesi training
-- ------------------------------------------------------------
create table trainings (
  id uuid primary key default gen_random_uuid(),
  nama_training text not null,
  tanggal_training date,
  cabang text,
  deskripsi text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. TRAINING_PARTICIPANTS — daftar peserta terdaftar per training
-- ------------------------------------------------------------
create table training_participants (
  id uuid primary key default gen_random_uuid(),
  training_id uuid references trainings(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  unique (training_id, user_id)
);

-- ------------------------------------------------------------
-- 6. ATTENDANCE — hasil absensi
-- ------------------------------------------------------------
create table attendance (
  id uuid primary key default gen_random_uuid(),
  training_id uuid references trainings(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  nomor_wa text not null,
  status text not null default 'Hadir',
  waktu_absen timestamptz not null default now(),
  unique (training_id, user_id)
);

-- ------------------------------------------------------------
-- 7. WA REMINDER — migrasi sistem lama (tugas, agenda, log)
-- ------------------------------------------------------------
create table wa_reminder_tasks (
  id uuid primary key default gen_random_uuid(),
  grup_target text not null,
  tugas text not null,
  tanggal_mulai date,
  deadline date,
  selesai boolean not null default false,
  created_at timestamptz not null default now()
);

create table wa_reminder_agenda (
  id uuid primary key default gen_random_uuid(),
  grup_target text not null,
  tanggal date not null,
  agenda text not null,
  created_at timestamptz not null default now()
);

create table wa_reminder_log (
  id uuid primary key default gen_random_uuid(),
  jenis text,
  status text,
  jumlah int,
  keterangan text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 8. AUDIT LOG — jejak semua aksi create/update/delete
-- ------------------------------------------------------------
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null check (action in ('create', 'update', 'delete')),
  table_name text not null,
  record_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 9. NOTIFICATIONS — notifikasi in-app
-- ------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade, -- null = broadcast semua
  title text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 10. APP_SETTINGS — token Fonnte, link spreadsheet, dsb (admin-only)
-- ------------------------------------------------------------
create table app_settings (
  key text primary key,
  value text
);

-- ------------------------------------------------------------
-- FUNGSI LOGIN BY NIK
-- Login di Portal ini menggunakan NIK, bukan email, mengikuti
-- kebiasaan sistem lama. Supabase Auth tetap berbasis email di
-- balik layar, jadi kita perlu resolve NIK -> auth email dulu,
-- SEBELUM user terautentikasi. Fungsi ini sengaja hanya
-- mengembalikan email (bukan data profil lain) agar aman
-- dipanggil publik lewat anon key.
-- ------------------------------------------------------------
create or replace function get_auth_email_by_nik(input_nik text)
returns text
language sql
security definer
set search_path = public
as $$
  select au.email
  from profiles p
  join auth.users au on au.id = p.id
  where p.nik = input_nik and p.is_active = true
  limit 1;
$$;

revoke all on function get_auth_email_by_nik(text) from public;
grant execute on function get_auth_email_by_nik(text) to anon, authenticated;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table stores enable row level security;
alter table akun_pintar enable row level security;
alter table trainings enable row level security;
alter table training_participants enable row level security;
alter table attendance enable row level security;
alter table wa_reminder_tasks enable row level security;
alter table wa_reminder_agenda enable row level security;
alter table wa_reminder_log enable row level security;
alter table audit_log enable row level security;
alter table notifications enable row level security;
alter table app_settings enable row level security;

-- Fungsi bantu: cek apakah pemanggil adalah admin
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES: user lihat/update profil sendiri, admin lihat/update semua
create policy "profiles_select" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_update" on profiles
  for update using (auth.uid() = id or is_admin());
create policy "profiles_insert_admin" on profiles
  for insert with check (is_admin());
create policy "profiles_delete_admin" on profiles
  for delete using (is_admin());

-- STORES: semua user login bisa lihat (referensi), hanya admin bisa ubah
create policy "stores_select" on stores for select using (auth.uid() is not null);
create policy "stores_write_admin" on stores for all using (is_admin());

-- AKUN_PINTAR: user kelola milik sendiri, admin kelola semua
create policy "akun_pintar_all" on akun_pintar
  for all using (user_id = auth.uid() or is_admin());

-- TRAININGS: semua user login bisa lihat, hanya admin bisa ubah
create policy "trainings_select" on trainings for select using (auth.uid() is not null);
create policy "trainings_write_admin" on trainings for all using (is_admin());

-- TRAINING_PARTICIPANTS: user lihat statusnya sendiri, admin kelola semua
create policy "participants_select" on training_participants
  for select using (user_id = auth.uid() or is_admin());
create policy "participants_write_admin" on training_participants
  for all using (is_admin());

-- ATTENDANCE: user insert/lihat milik sendiri (harus terdaftar di participants),
-- admin lihat/kelola semua
create policy "attendance_select" on attendance
  for select using (user_id = auth.uid() or is_admin());
create policy "attendance_insert_self" on attendance
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from training_participants tp
      where tp.training_id = attendance.training_id and tp.user_id = auth.uid()
    )
  );
create policy "attendance_update" on attendance
  for update using (user_id = auth.uid() or is_admin());

-- WA REMINDER & AUDIT LOG & SETTINGS: admin-only
create policy "wa_tasks_admin" on wa_reminder_tasks for all using (is_admin());
create policy "wa_agenda_admin" on wa_reminder_agenda for all using (is_admin());
create policy "wa_log_admin" on wa_reminder_log for all using (is_admin());
create policy "audit_log_admin_select" on audit_log for select using (is_admin());
create policy "audit_log_insert_any" on audit_log for insert with check (auth.uid() is not null);
create policy "app_settings_admin" on app_settings for all using (is_admin());

-- NOTIFICATIONS: user lihat miliknya + broadcast, admin kelola semua
create policy "notifications_select" on notifications
  for select using (user_id = auth.uid() or user_id is null or is_admin());
create policy "notifications_write_admin" on notifications for all using (is_admin());

-- ============================================================
-- REALTIME — aktifkan untuk tabel yang dipantau live oleh admin
-- ============================================================
alter publication supabase_realtime add table attendance;
alter publication supabase_realtime add table audit_log;
alter publication supabase_realtime add table notifications;
