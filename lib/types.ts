// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
export type Profile = {
  id: string;
  nik: string;
  nama: string;
  jabatan: string | null;
  kode_toko: string | null;
  nama_toko: string | null;
  email: string | null;
  nomor_wa: string | null;
  foto_url: string | null;
  role: "admin" | "user";
  is_active: boolean;
};
