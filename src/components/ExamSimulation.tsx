'use client';

import { useState, useEffect } from 'react';
import { saveProgress } from '@/lib/progress';

interface Question {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ExamSimulationProps {
  sessionId: number;
  onExit: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function ExamSimulation({ sessionId, onExit, darkMode, toggleDarkMode }: ExamSimulationProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ success: boolean; message: string; results: any } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch(`/api/session/${sessionId}`);
        if (!response.ok) throw new Error('Failed to load questions');
        const data = await response.json();
        setQuestions(data.questions);
        setLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        setError('Gagal memuat soal. Silakan coba lagi.');
        setLoading(false);
      }
    }
    loadQuestions();
  }, [sessionId]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (submitted || loading) return;
      
      if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      }
      if (e.key >= '1' && e.key <= '4') {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < questions[currentQuestionIndex]?.options.length) {
          handleAnswerSelect(questions[currentQuestionIndex].id, optionIndex);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, questions, submitted, loading]);

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    const formattedAnswers: { [key: string]: string } = {};
    Object.entries(answers).forEach(([questionId, answerIndex]) => {
      const letter = String.fromCharCode(65 + answerIndex);
      formattedAnswers[questionId] = letter;
    });

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          answers: formattedAnswers
        })
      });

      const data = await response.json();
      setResults(data);
      setSubmitted(true);

      if (data.success) {
        saveProgress(sessionId);
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResults(null);
    setCurrentQuestionIndex(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
        <div className="text-center max-w-md">
          {error ? (
            <>
              <div className="mb-6 flex justify-center">
                <div className="bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 p-4 rounded-full">
                  <svg className="w-16 h-16 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Terjadi Kesalahan</h2>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-8">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                aria-label="Muat ulang halaman"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Muat Ulang
              </button>
            </>
          ) : (
            <>
              <div className="mb-6 flex justify-center">
                <svg className="w-16 h-16 text-emerald-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-base text-gray-600 dark:text-gray-400 font-medium">Memuat soal...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (submitted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-4 md:px-6 py-3">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-xl shadow-lg shadow-emerald-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">Simulasi UPA PERADI</h1>
                <p className="text-xs text-slate-400">Ujian Profesi Advokat - Sistem Pembelajaran Gamifikasi</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <div className="mb-6 flex justify-center">
                {results.success ? (
                  <div className="bg-emerald-900/50 p-6 rounded-full">
                    <svg className="w-20 h-20 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ) : (
                  <div className="bg-amber-900/50 p-6 rounded-full">
                    <svg className="w-20 h-20 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                {results.success ? 'Sempurna!' : 'Belum Sempurna'}
              </h2>
              <p className="text-base md:text-lg text-slate-300 mb-8">
                {results.message}
              </p>
            </div>

            {!results.success && (
              <div className="bg-slate-800/40 border-2 border-amber-600/80 rounded-2xl p-6 md:p-8 mb-8 backdrop-blur-sm">
                <h3 className="font-bold text-amber-500 mb-4 flex items-center gap-2 text-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Jawaban yang Salah:
                </h3>
                <div className="space-y-3">
                  {Object.entries(results.results).map(([questionId, isCorrect]) => {
                    if (!isCorrect) {
                      const question = questions.find(q => q.id === parseInt(questionId));
                      return (
                        <div key={questionId} className="text-sm md:text-base text-slate-200 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>
                            <strong className="text-amber-500">Soal #{question?.id}:</strong> {question?.question.substring(0, 80)}...
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {results.success ? (
                <button 
                  onClick={onExit} 
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/40 transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label="Kembali ke beranda"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Kembali ke Beranda
                </button>
              ) : (
                <>
                  <button 
                    onClick={onExit} 
                    className="flex items-center justify-center gap-2 border-2 border-slate-600 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl font-medium transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    aria-label="Kembali"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali
                  </button>
                  <button 
                    onClick={handleRetry} 
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/40 transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    aria-label="Coba lagi"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Coba Lagi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-11 h-11 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Desktop: always visible, Mobile: slide-in overlay */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40
        w-64 md:w-56 
        bg-white/95 md:bg-white/80 dark:bg-gray-800/95 md:dark:bg-gray-800/80 
        backdrop-blur-md 
        border-r border-gray-200 dark:border-gray-700 
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo/Branding */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-xl shadow-lg shadow-emerald-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Simulasi UPA PERADI</h2>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Ujian Profesi Advokat - Sistem Pembelajaran Gamifikasi</p>
        </div>

        {/* Navigation Links */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={onExit}
            className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 w-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Keluar dari Ujian</span>
          </button>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button
              onClick={toggleDarkMode}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                darkMode ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/40' : 'bg-gray-300'
              }`}
              aria-label="Toggle dark mode"
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 flex items-center justify-center shadow-md ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {darkMode ? (
                  <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Session Info with Progress */}
        <div className="p-3 flex-1">
          <div className="mb-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Progress Sesi</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white mb-2">Sesi {sessionId} dari 20</div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(sessionId / 20) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{Math.round((sessionId / 20) * 100)}% selesai</div>
          </div>
          
          {/* Answered Count */}
          <div className="mt-4 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              {answeredCount} dari {questions.length} soal terjawab
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-600 dark:text-gray-400">
          <p className="font-medium">© 2025 Simulasi UPA PERADI</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            Made with 
            <svg className="w-3 h-3 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            by <span className="font-bold text-gray-800 dark:text-gray-200">Rezal Helvin Bramantara, S.H.</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full md:w-auto">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3">
          {/* Mobile: Add padding-left for hamburger button */}
          <div className="md:hidden h-11" aria-hidden="true" />
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate">Sesi {sessionId} - 10 Soal</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                Jawab semua dengan benar untuk melanjutkan
              </p>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 md:px-4 py-2 rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-emerald-500/30 whitespace-nowrap">
              Soal {currentQuestionIndex + 1} dari 10
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Topic Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                {currentQuestion.topic}
              </span>
            </div>

            {/* Question Text */}
            <p className="text-sm md:text-base text-gray-900 dark:text-white mb-4 md:mb-6 leading-relaxed font-medium">{currentQuestion.question}</p>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index);
                const isSelected = answers[currentQuestion.id] === index;
                
                return (
                  <label
                    key={index}
                    className={`block p-3 md:p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 min-h-[44px] flex items-center ${
                      isSelected
                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-emerald-500 hover:shadow-md'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected ? 'border-white bg-white scale-110' : 'border-gray-400 dark:border-gray-500'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                      </div>
                      <span className="text-sm"><strong>{optionLetter}.</strong> {option}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-2">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 min-w-[44px] min-h-[44px] bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              aria-label="Previous question"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            {/* Question Numbers */}
            <div className="flex gap-1 md:gap-1.5 overflow-x-auto scrollbar-hide">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`min-w-[44px] min-h-[44px] w-11 h-11 md:w-8 md:h-8 rounded-full font-bold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    index === currentQuestionIndex
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white scale-110 shadow-lg shadow-emerald-500/40'
                      : answers[q.id] !== undefined
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                } else if (allAnswered) {
                  handleSubmit();
                }
              }}
              disabled={currentQuestionIndex === questions.length - 1 && !allAnswered}
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 min-w-[44px] min-h-[44px] rounded-lg font-medium text-xs md:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                currentQuestionIndex === questions.length - 1 && allAnswered
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/40'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">{currentQuestionIndex === questions.length - 1 && allAnswered ? 'Submit Jawaban' : 'Selanjutnya'}</span>
              <span className="sm:hidden">{currentQuestionIndex === questions.length - 1 && allAnswered ? 'Submit' : 'Next'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
