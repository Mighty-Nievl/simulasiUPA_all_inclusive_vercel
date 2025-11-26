import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL
      ? (process.env.NEXT_PUBLIC_APP_URL.startsWith("http")
        ? process.env.NEXT_PUBLIC_APP_URL
        : `https://${process.env.NEXT_PUBLIC_APP_URL}`)
      : "https://simupa.web.id"
  ),
  title: {
    default: "Simulasi UPA - Latihan Ujian Profesi Advokat",
    template: "%s | Simulasi UPA",
  },
  description: "Platform simulasi ujian premium untuk persiapan Ujian Profesi Advokat (UPA) dengan sistem gamifikasi dan pembahasan lengkap.",
  keywords: ["UPA", "Advokat", "PERADI", "Ujian Profesi Advokat", "Simulasi Ujian", "Latihan Soal Hukum"],
  authors: [{ name: "Rezal Helvin Bramantara" }],
  creator: "Rezal Helvin Bramantara",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    title: "Simulasi UPA - Latihan Ujian Profesi Advokat",
    description: "Siap hadapi Ujian Profesi Advokat dengan simulasi gamifikasi premium.",
    siteName: "Simulasi UPA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulasi UPA - Latihan Ujian Profesi Advokat",
    description: "Siap hadapi Ujian Profesi Advokat dengan simulasi gamifikasi premium.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
