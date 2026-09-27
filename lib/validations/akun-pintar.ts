// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import { z } from "zod";

export const akunPintarSchema = z.object({
  emailPintar: z
    .string()
    .trim()
    .min(1, "Email pintar wajib diisi")
    .email("Format email tidak valid"),
  passwordPintar: z
    .string()
    .min(4, "Password minimal 4 karakter")
    .max(100, "Password terlalu panjang"),
});

export type AkunPintarInput = z.infer<typeof akunPintarSchema>;
