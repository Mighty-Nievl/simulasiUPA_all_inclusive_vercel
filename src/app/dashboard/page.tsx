"use client";

import { useState, useEffect } from "react";
import {
  getProgress,
  syncProgressWithDB,
} from "@/lib/progress";
import { createClient } from "@/lib/supabase/client";
import { SITE_CONFIG } from "@/lib/config";
import ExamSimulation from "@/components/ExamSimulation";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

export default function Home() {
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [progress, setProgress] = useState<{
    completedSessions: number[];
    currentSession: number;
  }>({ completedSessions: [], currentSession: 1 });

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<{ totalExams: number; averageScore: number } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = SITE_CONFIG.loginUrl;
        return;
      }
      setUser(user);
      setIsCheckingAuth(false);
      
      // Sync progress with DB
      syncProgressWithDB();

      // Fetch stats
      fetch('/api/history')
        .then(res => res.json())
        .then(data => {
          if (data.history) {
            const totalExams = data.history.length;
            const totalScore = data.history.reduce((acc: number, curr: any) => acc + curr.score, 0);
            setStats({
              totalExams,
              averageScore: totalExams > 0 ? Math.round(totalScore / totalExams) : 0
            });
          }
        })
        .catch(err => console.error("Failed to fetch stats:", err));
    };
    
    checkAuth();

    const currentProgress = getProgress();
    setProgress(currentProgress);
    
    // Listen for storage updates (from sync)
    const handleStorageChange = () => {
      const updatedProgress = getProgress();
      setProgress(updatedProgress);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleStartExam = () => {
    setSelectedSession(progress.currentSession);
  };

  const handleExitSession = () => {
    setSelectedSession(null);
    // Refresh stats
    fetch('/api/history')
        .then(res => res.json())
        .then(data => {
          if (data.history) {
            const totalExams = data.history.length;
            const totalScore = data.history.reduce((acc: number, curr: any) => acc + curr.score, 0);
            setStats({
              totalExams,
              averageScore: totalExams > 0 ? Math.round(totalScore / totalExams) : 0
            });
          }
        });
  };

  const handleNextSession = () => {
    if (selectedSession && selectedSession < 20) {
      setSelectedSession(selectedSession + 1);
      setProgress(getProgress());
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (selectedSession) {
    return (
      <ExamSimulation
        key={selectedSession}
        sessionId={selectedSession}
        onExit={handleExitSession}
        onNextSession={handleNextSession}
        user={user}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user.user_metadata?.full_name || user.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Peserta Ujian</p>
             </div>
             <ThemeToggle />
             <button 
               onClick={async () => {
                 if (confirm("Apakah Anda yakin ingin mereset semua progress? Data yang dihapus tidak dapat dikembalikan.")) {
                   try {
                     // 1. Reset server side
                     const res = await fetch('/api/progress/reset', { method: 'POST' });
                     if (!res.ok) throw new Error('Failed to reset server progress');
                     
                     // 2. Reset client side
                     const { resetProgress } = await import("@/lib/progress");
                     resetProgress();
                     
                     // 3. Reload
                     window.location.reload();
                   } catch (error) {
                     console.error("Reset failed:", error);
                     alert("Gagal mereset progress. Silakan coba lagi.");
                   }
                 }
               }}
               className="p-2 text-slate-400 hover:text-red-500 transition-colors"
               title="Reset Progress"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
               </svg>
             </button>
             <button 
                 onClick={async () => {
                   await supabase.auth.signOut();
                   window.location.href = `${window.location.protocol}//${SITE_CONFIG.rootDomain}`;
                 }}
               className="p-2 text-slate-400 hover:text-red-500 transition-colors"
               title="Keluar"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Selamat Datang, {user.user_metadata?.full_name?.split(' ')[0] || 'Calon Advokat'}!
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Siap untuk melanjutkan persiapan UPA Anda hari ini?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Ujian</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalExams || 0}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Rata-rata Nilai</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.averageScore || 0}%</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sesi Terbuka</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{progress.currentSession} <span className="text-sm font-normal text-slate-500">/ 20</span></h3>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Exam Card */}
          <div className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white overflow-hidden shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer" onClick={handleStartExam}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-all"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Mulai Ujian</h3>
              <p className="text-emerald-100 mb-6 max-w-sm">
                Lanjutkan progres Anda di Sesi {progress.currentSession}. Jawab 10 soal dengan benar untuk membuka sesi berikutnya.
              </p>
              <button className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl shadow-sm hover:bg-emerald-50 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mulai Sesi {progress.currentSession}
              </button>
            </div>
          </div>

          {/* History Card */}
          <Link href="/riwayat" className="group bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <svg className="w-8 h-8 text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400">
                Fitur Baru
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Riwayat Ujian</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Lihat kembali hasil ujian sebelumnya, pelajari jawaban yang salah, dan pantau perkembangan nilai Anda.
            </p>
            <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
              Lihat Riwayat
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
