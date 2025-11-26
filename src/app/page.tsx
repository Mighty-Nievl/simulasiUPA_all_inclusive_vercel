import { SITE_CONFIG } from "@/lib/config";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowRightIcon,
  BackgroundGrid,
  BookOpenIcon,
  CheckCircleIcon,
  LightningIcon,
  ListIcon,
  LogoIcon,
} from "@/components/icons/LandingIcons";

export default function LandingPage() {
  const rules = [
    {
      text: "Total 200 soal dibagi menjadi 20 sesi latihan",
      Icon: ListIcon,
    },
    {
      text: "Wajib benar 100% untuk lanjut ke sesi berikutnya",
      Icon: CheckCircleIcon,
      highlight: true,
    },
    {
      text: "Setiap sesi terdiri dari 10 soal pilihan ganda",
      Icon: BookOpenIcon,
    },
    {
      text: "Mencakup 8 materi hukum sesuai kisi-kisi PERADI",
      Icon: LogoIcon,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Simulasi UPA PERADI",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR",
    },
    "description": "Simulasi ujian advokat dengan sistem gamifikasi. Pelajari 200 soal terupdate dari 8 materi hukum utama.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1024",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col relative overflow-hidden selection:bg-emerald-500/30 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
        <BackgroundGrid />
      </div>

      <header className="relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-4 sticky top-0 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <LogoIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                Simulasi UPA PERADI
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Sistem Pembelajaran Gamifikasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-6 w-full max-w-6xl mx-auto">
        <div className="w-full grid md:grid-cols-2 gap-6 md:gap-12 items-center">
          {/* Hero Section */}
          <div className="text-left space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Edisi Terbaru 2025
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
              Siap Hadapi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400">
                Ujian Profesi?
              </span>
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-lg">
              Simulasi ujian advokat dengan sistem gamifikasi. Pelajari 200 soal
              terupdate dari 8 materi hukum utama.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={SITE_CONFIG.appUrl}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-900 font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 group"
              >
                <span className="relative z-10">Masuk ke Aplikasi</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                200 Soal Premium
              </div>
              <div className="flex items-center gap-2">
                <LightningIcon className="w-5 h-5 text-emerald-500" />
                Instant Feedback
              </div>
            </div>
          </div>

          {/* Rules Card */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 dark:opacity-20 opacity-10"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                  <BookOpenIcon className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Aturan Main
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Pahami sebelum mulai
                  </p>
                </div>
              </div>

              <ul className="space-y-4">
                {rules.map((rule, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-4 p-3 rounded-xl transition-colors ${
                      rule.highlight
                        ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <rule.Icon
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        rule.highlight
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    />
                    <span
                      className={`text-sm leading-relaxed ${
                        rule.highlight
                          ? "text-emerald-800 dark:text-emerald-100 font-medium"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {rule.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-slate-400 text-xs">
        <p>© 2025 Simulasi UPA PERADI. Made by Rezal Helvin Bramantara, S.H.</p>
      </footer>
    </div>
  );
}
