'use client';

import { useState, useEffect } from 'react';
import { getProgress, isSessionUnlocked, isSessionCompleted, resetProgress } from '@/lib/progress';
import ExamSimulation from '@/components/ExamSimulation';

export default function Home() {
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [progress, setProgress] = useState<{ completedSessions: number[], currentSession: number }>({ completedSessions: [], currentSession: 1 });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setProgress(getProgress());
    const isDark = localStorage.getItem('darkMode') === 'true' || document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleStartExam = () => {
    setSelectedSession(1);
  };

  const handleExitSession = () => {
    setSelectedSession(null);
    setProgress(getProgress());
  };

  const handleResetProgress = () => {
    resetProgress();
    setProgress({ completedSessions: [], currentSession: 1 });
    setShowResetConfirm(false);
    fetch('/api/reset', { method: 'POST' });
  };

  if (selectedSession) {
    return <ExamSimulation sessionId={selectedSession} onExit={handleExitSession} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
  }

  const completedCount = progress.completedSessions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-4 md:px-6 py-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg shadow-emerald-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight truncate">Simulasi UPA PERADI</h1>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">Ujian Profesi Advokat - Sistem Pembelajaran Gamifikasi</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 w-full">
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-2xl shadow-black/30 w-full overflow-hidden border border-slate-700">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 md:p-10 overflow-hidden flex flex-col justify-center border-r border-slate-700/50">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  Siap Hadapi <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">UPA?</span>
                </h2>
                <p className="text-sm md:text-base text-slate-300 mb-6 md:mb-8 leading-relaxed">
                  Sistem simulasi ini dirancang untuk membantu Anda mempersiapkan Ujian Profesi Advokat (UPA) PERADI dengan materi terupdate.
                </p>
                <button
                  onClick={handleStartExam}
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-white font-bold py-3 md:py-4 px-8 md:px-10 rounded-xl md:rounded-2xl shadow-xl shadow-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 active:scale-95 text-sm md:text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label="Mulai ujian simulasi UPA"
                >
                  Mulai Ujian
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 md:p-10 bg-slate-800/60">
              <div className="flex items-center gap-2.5 mb-4 md:mb-5">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white">Aturan Ujian</h3>
              </div>
              <ul className="space-y-2 md:space-y-3">
                {[
                  { text: 'Total <strong class="text-white font-bold">200 soal</strong> dibagi menjadi 20 sesi', critical: false },
                  { text: 'Setiap sesi berisi <strong class="text-white font-bold">10 soal</strong> pilihan ganda', critical: false },
                  { text: 'Anda harus menjawab <strong class="text-amber-400 font-extrabold">100% benar</strong> untuk melanjutkan ke sesi berikutnya', critical: true },
                  { text: 'Jika ada jawaban salah, Anda harus mengulang sesi yang sama', critical: false },
                  { text: 'Materi mencakup <strong class="text-white font-bold">8 bidang hukum</strong> sesuai kisi-kisi PERADI', critical: false }
                ].map((rule, index) => (
                  <li key={index} className={`flex items-start gap-3 p-2 rounded-lg ${rule.critical ? 'bg-amber-500/10 border-l-4 border-amber-500 shadow-sm' : 'hover:bg-slate-700/30'} transition-all group min-h-[44px]`}>
                    <div className={`${rule.critical ? 'bg-amber-900/40' : 'bg-emerald-900/30 group-hover:scale-110'} p-1 rounded-lg mt-0.5 transition-transform`}>
                      <svg className={`w-4 h-4 ${rule.critical ? 'text-amber-400' : 'text-emerald-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {rule.critical ? (
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        )}
                      </svg>
                    </div>
                    <span className={`leading-relaxed text-sm ${rule.critical ? 'text-slate-200 font-semibold' : 'text-slate-300 font-medium'}`} dangerouslySetInnerHTML={{ __html: rule.text }} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {completedCount > 0 && (
            <div className="px-6 md:px-10 pb-3 md:pb-4 bg-slate-800/60 border-t border-slate-700/50">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg"
                aria-label="Reset progress"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Progress
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-slate-800/50 backdrop-blur-sm border-t border-slate-700 py-3 md:py-4 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center text-xs text-slate-400">
          <p className="font-medium">© 2025 Simulasi UPA PERADI</p>
          <p className="mt-1 md:mt-1.5 flex items-center justify-center gap-1 md:gap-1.5 flex-wrap">
            Made with 
            <svg className="w-3.5 h-3.5 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            by <span className="font-bold text-slate-200">Rezal Helvin Bramantara, S.H.</span>
          </p>
        </div>
      </footer>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl transform animate-scaleIn border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-900/30 p-2 rounded-lg">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Reset Progress?</h3>
            </div>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Semua progress Anda akan dihapus dan Anda akan kembali ke Sesi 1. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-6 py-3 border-2 border-slate-600 text-slate-200 font-semibold rounded-xl hover:bg-slate-700 transition-all duration-200 hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Batal
              </button>
              <button
                onClick={handleResetProgress}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
