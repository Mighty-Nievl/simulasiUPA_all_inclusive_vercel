"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] opacity-30" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v17M5 6h14M5 6l-2 8a3 3 0 0 0 6 0l-2-8M19 6l-2 8a3 3 0 0 0 6 0l-2-8M9 21h6" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Simulasi UPA</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Fitur</a>
            <a href="#pricing" className="hover:text-white transition-colors">Harga</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <a
            href="https://app.simupa.web.id"
            className="px-5 py-2.5 bg-white text-slate-950 font-bold rounded-lg hover:bg-slate-200 transition-colors"
          >
            Masuk Aplikasi
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Edisi Terbaru 2025
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Lulus Ujian Advokat <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Sekali Tes.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Platform simulasi ujian profesi advokat (UPA) paling komprehensif dengan sistem gamifikasi, pembahasan mendalam, dan materi terupdate sesuai kisi-kisi PERADI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://app.simupa.web.id"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all transform hover:scale-105 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              Mulai Simulasi Gratis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12">
            {[
              { label: "Soal Premium", value: "200+" },
              { label: "Pengguna Lulus", value: "85%" },
              { label: "Materi Hukum", value: "8 Topik" },
              { label: "Rating", value: "4.9/5" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Fitur Unggulan</h2>
            <p className="text-slate-400">Semua yang Anda butuhkan untuk lulus UPA</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Sistem Gamifikasi",
                desc: "Belajar jadi tidak membosankan dengan sistem level, poin, dan progress bar interaktif.",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
              },
              {
                title: "Pembahasan Lengkap",
                desc: "Setiap soal dilengkapi dasar hukum dan penjelasan logis untuk memahami konsep.",
                icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
              },
              {
                title: "Mode Gelap & Terang",
                desc: "Nyaman di mata dengan dukungan dark mode otomatis sesuai preferensi sistem Anda.",
                icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
              },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-colors group">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-slate-400 text-sm">
        <p>&copy; 2025 Simulasi UPA PERADI. All rights reserved.</p>
      </footer>
    </div>
  );
}
