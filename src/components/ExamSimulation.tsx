"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  saveProgress,
  getProgress,
  saveSessionQuestions,
  getSessionQuestions,
  saveCurrentAnswers,
  getCurrentAnswers,
  clearCurrentAnswers,
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
  const [direction, setDirection] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const assignedIds = getSessionQuestions(sessionId);

        if (assignedIds && assignedIds.length > 0) {
          const response = await fetch("/api/questions/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionIds: assignedIds }),
          });

          if (!response.ok) throw new Error("Failed to load assigned questions");
          const data = await response.json();
          setQuestions(data.questions);
        } else {
          const progress = getProgress();
          const response = await fetch("/api/questions/random", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              excludeIds: progress.masteredQuestionIds,
              count: 10,
            }),
          });

          if (!response.ok) throw new Error("Failed to load random questions");
          const data = await response.json();

          const newQuestionIds = data.questions.map((q: Question) => q.id);
          saveSessionQuestions(sessionId, newQuestionIds);

          setQuestions(data.questions);
        }

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

  // Timer Effect
  useEffect(() => {
    if (loading || submitted) return;
    
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (submitted || loading) return;

      if (e.key === "ArrowRight" && currentQuestionIndex < questions.length - 1) {
        paginate(1);
      }
      if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
        paginate(-1);
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

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentQuestionIndex((prev) => prev + newDirection);
  };

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (submitted) return;

    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: optionIndex,
      };
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
        const correctIds = questions.map((q) => q.id);
        saveProgress(sessionId, correctIds);
        clearCurrentAnswers(sessionId);

        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        // Trigger Confetti
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#10b981", "#34d399", "#059669"],
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#10b981", "#34d399", "#059669"],
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        })();
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    clearCurrentAnswers(sessionId);
    setSubmitted(false);
    setResults(null);
    setCurrentQuestionIndex(0);
    setElapsedTime(0);
    setQuestions((prev) => [...prev].sort(() => 0.5 - Math.random()));
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 transition-colors duration-300">
        <div className="text-center max-w-md">
          {error ? (
            <>
              <div className="mb-6 flex justify-center">
                <div className="bg-red-500/10 p-4 rounded-full">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Terjadi Kesalahan</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
              <button onClick={() => window.location.reload()} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors">
                Muat Ulang
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Memuat soal...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 transition-colors duration-300">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
              <svg className="w-16 h-16 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Tidak Ada Soal</h2>
          <p className="text-base text-slate-500 dark:text-slate-400 mb-8">
            Maaf, tidak ada soal yang tersedia untuk sesi ini. Silakan coba reset progress atau hubungi admin.
          </p>
          <button
            onClick={onExit}
            className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold py-3 px-8 rounded-xl transition-all"
          >
            Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  if (submitted && results) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
        <header className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Hasil Simulasi</h1>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
          <div className="w-full max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="mb-6 flex justify-center">
                {results.success ? (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="bg-emerald-100 dark:bg-emerald-500/20 p-6 rounded-full ring-4 ring-emerald-50 dark:ring-emerald-500/20"
                  >
                    <svg className="w-20 h-20 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                ) : (
                  <div className="bg-amber-100 dark:bg-amber-500/20 p-6 rounded-full ring-4 ring-amber-50 dark:ring-amber-500/20">
                    <svg className="w-20 h-20 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                )}
              </div>
              <h2 className="text-4xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
                {results.success ? "Luar Biasa!" : "Sesi Selesai"}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">{results.message}</p>
            </motion.div>

            {!results.success && (
              <div className="space-y-6 mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-1 bg-amber-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pembahasan</h3>
                </div>

                {questions.map((q, index) => {
                  const userAnswerIndex = answers[q.id];
                  const isCorrect = userAnswerIndex === q.correctAnswer;

                  if (isCorrect) return null;

                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={q.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-4">
                          <p className="text-slate-900 dark:text-white font-medium text-lg leading-relaxed">
                            {q.question}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1 block">Jawaban Anda</span>
                              <span className="text-slate-700 dark:text-slate-200">{q.options[userAnswerIndex] || "Tidak dijawab"}</span>
                            </div>
                            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 block">Jawaban Benar</span>
                              <span className="text-slate-700 dark:text-slate-200">{q.options[q.correctAnswer]}</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                              <span className="font-semibold text-slate-800 dark:text-slate-300 block mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Penjelasan
                              </span>
                              {q.explanation || "Tidak ada penjelasan tersedia."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center pb-10">
              <button
                onClick={handleRetry}
                className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Ulangi Sesi
              </button>
              <button
                onClick={onExit}
                className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                Kembali ke Menu
              </button>
              {results.success && sessionId < 20 && (
                <button
                  onClick={onNextSession}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Lanjut Sesi {sessionId + 1}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
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
  const progressPercentage = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-emerald-500/30 transition-colors duration-300">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: mobileMenuOpen ? "100%" : "auto" }}
        className={`fixed md:relative z-40 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col ${
          mobileMenuOpen ? "w-full" : "hidden md:flex md:w-72"
        }`}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v17M5 6h14M5 6l-2 8a3 3 0 0 0 6 0l-2-8M19 6l-2 8a3 3 0 0 0 6 0l-2-8M9 21h6" />
                </svg>
              </div>
              <h1 className="font-bold text-slate-900 dark:text-white tracking-tight">Simulasi UPA</h1>
            </div>
            {/* Close Button (Mobile Only) */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-slate-500 ml-11">Sistem Pembelajaran Advokat</p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Timer Widget */}
          <div className="mb-8 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider">Waktu Berjalan</span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white tracking-widest">
              {formatTime(elapsedTime)}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Progress Sesi {sessionId}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  setDirection(idx > currentQuestionIndex ? 1 : -1);
                  setCurrentQuestionIndex(idx);
                  setMobileMenuOpen(false);
                }}
                className={`aspect-square rounded-lg text-xs font-bold transition-all ${
                  idx === currentQuestionIndex
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110 z-10"
                    : answers[q.id] !== undefined
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between px-2">
             <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Mode Tampilan</span>
             <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
            >
              {darkMode ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          <button
            onClick={onExit}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar Ujian
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">{currentQuestionIndex + 1}</span>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">dari {questions.length} soal</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentQuestionIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <div className="mb-6">
                  <span className="inline-block px-4 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm shadow-emerald-500/5">
                    {currentQuestion.topic}
                  </span>
                  <h2 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                    {currentQuestion.question}
                  </h2>
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentQuestion.id] === index;
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                        className={`w-full p-4 md:p-5 rounded-2xl text-left transition-all border-2 relative overflow-hidden group ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                            isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className={`text-base md:text-lg ${isSelected ? "text-emerald-900 dark:text-white font-medium" : "text-slate-600 dark:text-slate-300"}`}>
                            {option}
                          </span>
                        </div>
                        {isSelected && (
                          <motion.div
                            layoutId="highlight"
                            className="absolute inset-0 bg-emerald-500/5"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 md:p-8 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <button
              onClick={() => paginate(-1)}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Sebelumnya
            </button>

            <div className="hidden md:flex items-center gap-3 text-lg font-bold text-slate-400 dark:text-slate-500">
              <span className="text-slate-900 dark:text-white">{currentQuestionIndex + 1}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              <span>{questions.length}</span>
            </div>

            <button
              onClick={() => {
                if (currentQuestionIndex < questions.length - 1) {
                  paginate(1);
                } else if (allAnswered) {
                  handleSubmit();
                }
              }}
              disabled={currentQuestionIndex === questions.length - 1 && !allAnswered}
              className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${
                currentQuestionIndex === questions.length - 1
                  ? allAnswered
                    ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/25"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/20"
              }`}
            >
              {currentQuestionIndex === questions.length - 1 ? (
                allAnswered ? "Selesai & Nilai" : "Jawab Semua Dulu"
              ) : (
                <>
                  Selanjutnya
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
