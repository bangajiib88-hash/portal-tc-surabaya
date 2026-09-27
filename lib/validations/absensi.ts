// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import { z } from "zod";

export const nomorWaSchema = z
  .string()
  .trim()
  .min(9, "Nomor WhatsApp terlalu pendek")
  .max(15, "Nomor WhatsApp terlalu panjang")
  .regex(/^(0|62)8[0-9]{7,12}$/, "Format nomor tidak valid, gunakan 08xx atau 628xx");

export const absensiSchema = z.object({
  trainingId: z.string().uuid(),
  nomorWa: nomorWaSchema,
});

export type AbsensiInput = z.infer<typeof absensiSchema>;
