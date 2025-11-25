"use client";

import { useState, useEffect } from "react";
import { 
  saveProgress, 
  getProgress, 
  saveSessionQuestions, 
  getSessionQuestions,
  saveCurrentAnswers,
  getCurrentAnswers,
  clearCurrentAnswers
} from "@/lib/progress";

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
  onNextSession: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function ExamSimulation({
  sessionId,
  onExit,
  onNextSession,
  darkMode,
  toggleDarkMode,
}: ExamSimulationProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{
    success: boolean;
    message: string;
    results: any;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        // 1. Check if we already have questions assigned for this session
        const assignedIds = getSessionQuestions(sessionId);
        
        if (assignedIds && assignedIds.length > 0) {
          // Fetch these specific questions
          const response = await fetch('/api/questions/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionIds: assignedIds })
          });
          
          if (!response.ok) throw new Error("Failed to load assigned questions");
          const data = await response.json();
          setQuestions(data.questions);
        } else {
          // 2. Fetch new random questions excluding mastered ones
          const progress = getProgress();
          const response = await fetch('/api/questions/random', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              excludeIds: progress.masteredQuestionIds,
              count: 10
            })
          });

          if (!response.ok) throw new Error("Failed to load random questions");
          const data = await response.json();
          
          // Save these questions as assigned for this session
          const newQuestionIds = data.questions.map((q: Question) => q.id);
          saveSessionQuestions(sessionId, newQuestionIds);
          
          setQuestions(data.questions);
        }
        
        // Load saved answers if any
        const savedAnswers = getCurrentAnswers(sessionId);
        if (savedAnswers) {
          setAnswers(savedAnswers);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading questions:", error);
        setError("Gagal memuat soal. Silakan coba lagi.");
        setLoading(false);
      }
    }
    loadQuestions();
  }, [sessionId]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (submitted || loading) return;

      if (
        e.key === "ArrowRight" &&
        currentQuestionIndex < questions.length - 1
      ) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
      if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
      }
      if (e.key >= "1" && e.key <= "4") {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < questions[currentQuestionIndex]?.options.length) {
          handleAnswerSelect(questions[currentQuestionIndex].id, optionIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentQuestionIndex, questions, submitted, loading]);

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (submitted) return;

    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: optionIndex,
      };
      // Persist answers
      saveCurrentAnswers(sessionId, newAnswers);
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    const formattedAnswers: { [key: string]: string } = {};
    Object.entries(answers).forEach(([questionId, answerIndex]) => {
      const letter = String.fromCharCode(65 + answerIndex);
      formattedAnswers[questionId] = letter;
    });

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          answers: formattedAnswers,
        }),
      });

      const data = await response.json();
      setResults(data);
      setSubmitted(true);

      if (data.success) {
        // Identify correct questions to mark as mastered
        const correctIds = questions.map(q => q.id); // Since success means 100% correct
        saveProgress(sessionId, correctIds);
        clearCurrentAnswers(sessionId); // Clear saved answers on success
        
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    clearCurrentAnswers(sessionId); // Clear saved answers on retry
    setSubmitted(false);
    setResults(null);
    setCurrentQuestionIndex(0);
    // Shuffle current questions
    setQuestions(prev => [...prev].sort(() => 0.5 - Math.random()));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="text-center max-w-md">
          {error ? (
            <>
              <div className="mb-6 flex justify-center">
                <div className="bg-red-900/30 p-4 rounded-full">
                  <svg
                    className="w-16 h-16 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Terjadi Kesalahan
              </h2>
              <p className="text-base text-slate-400 mb-8">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Muat Ulang
              </button>
            </>
          ) : (
            <>
              <div className="mb-6 flex justify-center">
                <svg
                  className="w-16 h-16 text-emerald-500 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <p className="text-base text-slate-400 font-medium">
                Memuat soal...
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="bg-slate-800 p-4 rounded-full">
              <svg className="w-16 h-16 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Tidak Ada Soal</h2>
          <p className="text-base text-slate-400 mb-8">
            Maaf, tidak ada soal yang tersedia untuk sesi ini. Silakan coba reset progress atau hubungi admin.
          </p>
          <button
            onClick={onExit}
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-xl transition-all"
          >
            Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  if (submitted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-4 md:px-6 py-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-xl shadow-lg shadow-emerald-500/30">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">
                  Simulasi UPA PERADI
                </h1>
                <p className="text-xs text-slate-400">
                  Ujian Profesi Advokat - Sistem Pembelajaran Gamifikasi
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-8">
              <div className="mb-4 flex justify-center">
                {results.success ? (
                  <div className="bg-emerald-500/10 p-4 rounded-full">
                    <svg
                      className="w-12 h-12 text-emerald-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 p-4 rounded-full">
                    <svg
                      className="w-12 h-12 text-amber-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">
                {results.success ? "Sempurna!" : "Hasil Sesi"}
              </h2>
              <p className="text-slate-400">{results.message}</p>
            </div>

            {!results.success && (
              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-1 bg-amber-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-white">
                    Pembahasan Jawaban Salah
                  </h3>
                </div>

                {questions.map((q, index) => {
                  const userAnswerIndex = answers[q.id];
                  const isCorrect = userAnswerIndex === q.correctAnswer;

                  if (isCorrect) return null;

                  return (
                    <div
                      key={q.id}
                      className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-6 h-6 bg-slate-700 rounded text-xs font-bold text-slate-300 flex items-center justify-center mt-1">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-4">
                          <p className="text-white font-medium text-lg">
                            {q.question}
                          </p>

                          <div className="space-y-2">
                            <div className="flex items-start gap-3 text-sm">
                              <span className="text-red-400 font-medium min-w-[100px]">
                                Jawaban Anda:
                              </span>
                              <span className="text-slate-300">
                                {q.options[userAnswerIndex] || "Tidak dijawab"}
                              </span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                              <span className="text-emerald-400 font-medium min-w-[100px]">
                                Jawaban Benar:
                              </span>
                              <span className="text-slate-300">
                                {q.options[q.correctAnswer]}
                              </span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-700/50">
                            <p className="text-slate-400 text-sm leading-relaxed">
                              <span className="font-semibold text-slate-300 block mb-1">
                                Penjelasan:
                              </span>
                              {q.explanation ||
                                "Maaf, tidak ada penjelasan untuk soal ini."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Ulangi Sesi Ini
              </button>
              <button
                onClick={onExit}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Kembali ke Beranda
              </button>
              {results.success && sessionId < 20 ? (
                <button
                  onClick={onNextSession}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <span>Lanjut Sesi {sessionId + 1}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              ) : sessionId < 20 && (
                <p className="text-xs text-slate-500 mt-2 max-w-[200px] text-center">
                  Tombol lanjut akan muncul jika nilai 100%
                </p>
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
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-11 h-11 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
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
      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-40
        w-64 md:w-56 
        bg-slate-800/95 md:bg-slate-800/80 
        backdrop-blur-md 
        border-r border-slate-700 
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }
      `}
      >
        {/* Logo/Branding */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-xl shadow-lg shadow-emerald-500/30">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Simulasi UPA PERADI
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Ujian Profesi Advokat - Sistem Pembelajaran Gamifikasi
          </p>
        </div>

        {/* Navigation Links */}
        <div className="p-3 border-b border-slate-700">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-xs text-slate-300 hover:text-emerald-400 w-full transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Keluar dari Ujian</span>
          </button>
        </div>

        {/* Session Info with Progress */}
        <div className="p-3 flex-1">
          <div className="mb-3">
            <div className="text-xs text-slate-400 mb-2 font-medium">
              Progress Sesi
            </div>
            <div className="text-sm font-bold text-white mb-2">
              Sesi {sessionId} dari 20
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(sessionId / 20) * 100}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {Math.round((sessionId / 20) * 100)}% selesai
            </div>
          </div>

          {/* Answered Count */}
          <div className="mt-4 p-2 bg-emerald-900/20 rounded-lg">
            <div className="text-xs text-emerald-400 font-medium">
              {answeredCount} dari {questions.length} soal terjawab
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 text-center text-xs text-slate-400">
          <p className="font-medium">© 2025 Simulasi UPA PERADI</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            Made with
            <svg
              className="w-3 h-3 text-red-500 animate-pulse"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            by{" "}
            <span className="font-bold text-slate-200">
              Rezal Helvin Bramantara, S.H.
            </span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full md:w-auto">
        {/* Header */}
        <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-4 md:px-6 py-3">
          {/* Mobile: Add padding-left for hamburger button */}
          <div className="md:hidden h-11" aria-hidden="true" />
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm md:text-base font-bold text-white truncate">
                Sesi {sessionId} - 10 Soal
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                Jawab semua dengan benar untuk melanjutkan
              </p>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 md:px-4 py-2 rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-emerald-500/30 whitespace-nowrap">
              Soal {currentQuestionIndex + 1} dari 10
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 bg-slate-900 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Topic Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/30 text-emerald-400 text-xs font-semibold rounded-lg">
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                {currentQuestion.topic}
              </span>
            </div>

            {/* Question Text */}
            <p className="text-sm md:text-base text-white mb-4 md:mb-6 leading-relaxed font-medium">
              {currentQuestion.question}
            </p>

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
                        ? "border-emerald-500 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                        : "border-slate-700 bg-slate-800 text-white hover:border-emerald-500 hover:shadow-md"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={isSelected}
                      onChange={() =>
                        handleAnswerSelect(currentQuestion.id, index)
                      }
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? "border-white bg-white scale-110"
                            : "border-slate-500"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <span className="text-sm">
                        <strong>{optionLetter}.</strong> {option}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bg-slate-800/80 backdrop-blur-md border-t border-slate-700 px-4 md:px-6 py-3">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-2">
            <button
              onClick={() =>
                setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
              }
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 min-w-[44px] min-h-[44px] bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              aria-label="Previous question"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
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
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white scale-110 shadow-lg shadow-emerald-500/40"
                      : answers[q.id] !== undefined
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-700 text-white hover:bg-slate-600"
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
              disabled={
                currentQuestionIndex === questions.length - 1 && !allAnswered
              }
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 min-w-[44px] min-h-[44px] rounded-lg font-medium text-xs md:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                currentQuestionIndex === questions.length - 1 && allAnswered
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/40"
                  : "bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <span className="hidden sm:inline">
                {currentQuestionIndex === questions.length - 1 && allAnswered
                  ? "Submit Jawaban"
                  : "Selanjutnya"}
              </span>
              <span className="sm:hidden">
                {currentQuestionIndex === questions.length - 1 && allAnswered
                  ? "Submit"
                  : "Next"}
              </span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
