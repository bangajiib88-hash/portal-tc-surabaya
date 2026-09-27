# Portal TC Surabaya

Portal HRD terpadu untuk Training Center Surabaya — menggabungkan absensi
training, data akun Pintar, dan reminder WhatsApp otomatis dalam satu sistem
berbasis role admin/user.

## Pembuat / Hak Cipta

Dibuat dan dikembangkan oleh **Bang Ajiib**, tahun 2026.
Hak cipta dilindungi — lihat file [`LICENSE`](./LICENSE).

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Supabase** — Auth, Postgres (Row Level Security), Realtime
- **Tailwind CSS** — tema terang/gelap, brand Indomaret
- **Sonner** — notifikasi toast
- Deploy: dimulai di Google AI Studio → produksi di **Vercel**

## Status Pengembangan

Tahap 1 (setup awal) — sedang berjalan:
- [x] Skema database & Row Level Security (`supabase/schema.sql`)
- [x] Autentikasi berbasis NIK (Supabase Auth)
- [x] Layout dasar, tema terang/gelap, branding
- [ ] Modul Absensi Training
- [ ] Modul Akun Pintar
- [ ] Modul Admin (monitoring real-time, impor/ekspor, reminder WA)

## Menjalankan Secara Lokal

```bash
npm install
cp .env.example .env.local   # isi kredensial Supabase & Fonnte Anda
npm run dev
```

Jalankan `supabase/schema.sql` di Supabase SQL Editor pada project baru
sebelum menjalankan aplikasi.
"# portal-tc-surabaya" 
