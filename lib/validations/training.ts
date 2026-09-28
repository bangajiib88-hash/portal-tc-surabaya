// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import { z } from "zod";

export const trainingSchema = z.object({
  namaTraining: z
    .string()
    .trim()
    .min(3, "Nama training wajib diisi (minimal 3 karakter)"),
  tanggalTraining: z.string().trim().optional(),
  cabang: z.string().trim().optional(),
  deskripsi: z.string().trim().optional(),
});

export type TrainingInput = z.infer<typeof trainingSchema>;

export const addParticipantsSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, "Pilih minimal satu peserta"),
});

export type AddParticipantsInput = z.infer<typeof addParticipantsSchema>;
