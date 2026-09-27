// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Portal TC Surabaya",
  description:
    "Portal HRD terpadu Training Center Surabaya — absensi training, akun pintar, dan reminder WhatsApp dalam satu sistem.",
  authors: [{ name: "Bang Ajiib" }],
  other: {
    author: "Bang Ajiib",
    copyright: "Copyright © 2026 Bang Ajiib. All rights reserved.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} font-body`}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <footer className="border-t border-[rgb(var(--border))] py-4 text-center text-xs text-ink-soft">
              Portal TC Surabaya • Bang Ajiib © 2026
            </footer>
          </div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
