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

export type Training = {
  id: string;
  nama_training: string;
  tanggal_training: string | null;
  cabang: string | null;
  deskripsi: string | null;
  created_at: string;
};

export type TrainingWithCounts = Training & {
  participant_count: number;
  attendance_count: number;
};

export type TrainingParticipantRow = {
  id: string; // id baris training_participants (dipakai untuk hapus)
  user_id: string;
  nik: string;
  nama: string;
  kode_toko: string | null;
  nama_toko: string | null;
  sudah_absen: boolean;
};
