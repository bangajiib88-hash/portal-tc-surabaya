// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import { z } from "zod";

export const settingsSchema = z.object({
  fonnteToken: z.string().trim().optional(),
  spreadsheetUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^https:\/\/.+/i.test(v),
      "Link spreadsheet harus diawali https://"
    ),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
