// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import { z } from "zod";

export const userSchema = z.object({
  nik: z.string().trim().min(3, "NIK wajib diisi"),
  nama: z.string().trim().min(2, "Nama wajib diisi"),
  jabatan: z.string().trim().optional(),
  kodeToko: z.string().trim().optional(),
  namaToko: z.string().trim().optional(),
  email: z.string().trim().email("Format email tidak valid"),
  nomorWa: z.string().trim().optional(),
  role: z.enum(["admin", "user"]),
});

export const createUserSchema = userSchema.extend({
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type UserInput = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
