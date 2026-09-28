// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { saveSettings, removeFonnteToken } from "./actions";

type Props = {
  spreadsheetUrlAwal: string;
  tokenTersimpan: boolean;
  tokenAkhir: string;
};

const inputClass =
  "w-full rounded-control border border-[rgb(var(--border))] bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-brand-blue";
const labelClass = "mb-1.5 block text-sm font-medium";

export function SettingsForm({ spreadsheetUrlAwal, tokenTersimpan, tokenAkhir }: Props) {
  const [pending, startTransition] = useTransition();
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(spreadsheetUrlAwal);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveSettings({
        fonnteToken: token,
        spreadsheetUrl,
      });
      if (result.success) {
        toast.success(result.message);
        setToken("");
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleRemoveToken() {
    if (!window.confirm("Hapus token Fonnte? Reminder WhatsApp tidak akan bisa terkirim sampai token diisi lagi.")) {
      return;
    }
    startTransition(async () => {
      const result = await removeFonnteToken();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-card border border-[rgb(var(--border))] bg-surface p-6"
    >
      <div>
        <label htmlFor="token" className={labelClass}>
          Token Fonnte (untuk kirim WhatsApp)
        </label>
        <div className="relative">
          <input
            id="token"
            type={showToken ? "text" : "password"}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            placeholder={
              tokenTersimpan
                ? "Kosongkan jika tidak ingin mengganti token"
                : "Tempel token dari dashboard Fonnte"
            }
            className={inputClass + " pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowToken((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
            aria-label={showToken ? "Sembunyikan token" : "Lihat token"}
          >
            {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          {tokenTersimpan ? (
            <span className="text-emerald-600">
              Token sudah tersimpan (berakhiran ••••{tokenAkhir})
            </span>
          ) : (
            <span className="text-ink-soft">Belum ada token tersimpan.</span>
          )}
          {tokenTersimpan && (
            <button
              type="button"
              onClick={handleRemoveToken}
              disabled={pending}
              className="flex items-center gap-1 text-brand-red hover:underline disabled:opacity-50"
            >
              <Trash2 size={12} /> Hapus token
            </button>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="spreadsheet" className={labelClass}>
          Link Google Spreadsheet
        </label>
        <input
          id="spreadsheet"
          value={spreadsheetUrl}
          onChange={(e) => setSpreadsheetUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          className={inputClass}
        />
        <p className="mt-2 text-xs text-ink-soft">
          Dipakai nanti untuk sinkronisasi data ke spreadsheet. Boleh dikosongkan.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-control bg-brand-blue py-2.5 text-sm font-semibold text-white transition hover:bg-brand-blue-deep disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan Pengaturan"}
      </button>
    </form>
  );
}
