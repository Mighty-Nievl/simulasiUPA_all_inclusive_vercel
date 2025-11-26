"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { SITE_CONFIG } from "@/lib/config";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

interface Question {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ExamResult {
  id: string;
  session_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  answers: { [key: string]: number };
  created_at: string;
}

export default function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = SITE_CONFIG.loginUrl;
        return;
      }

      try {
        // Load result
        const resultRes = await fetch(`/api/history/${unwrappedParams.id}`);
        const resultData = await resultRes.json();
        
        if (resultData.result) {
          setResult(resultData.result);
          
          // Load questions for this session
          // We need to fetch the specific questions that were answered
          // Since we stored answers as { questionId: answerIndex }, we can extract IDs
          const questionIds = Object.keys(resultData.result.answers).map(id => parseInt(id));
          
          const questionsRes = await fetch("/api/questions/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionIds }),
          });
          
          const questionsData = await questionsRes.json();
          setQuestions(questionsData.questions);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Data Tidak Ditemukan</h2>
          <Link href="/riwayat" className="text-emerald-600 hover:text-emerald-500 font-medium">
            Kembali ke Riwayat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/riwayat" className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Detail Riwayat</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 text-center">
          <div className="mb-4">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skor Anda</span>
          </div>
          <div className={`text-6xl font-bold mb-4 ${
            result.score === 100 ? "text-emerald-600 dark:text-emerald-500" : "text-amber-600 dark:text-amber-500"
          }`}>
            {result.score}
          </div>
          <div className="flex justify-center gap-8 text-sm">
            <div>
              <span className="block font-bold text-slate-900 dark:text-white">{result.correct_answers}</span>
              <span className="text-slate-500 dark:text-slate-400">Benar</span>
            </div>
            <div>
              <span className="block font-bold text-slate-900 dark:text-white">{result.total_questions - result.correct_answers}</span>
              <span className="text-slate-500 dark:text-slate-400">Salah</span>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Pembahasan Soal</h3>
          
          {questions.map((q, index) => {
            const userAnswerIndex = result.answers[q.id];
            const isCorrect = userAnswerIndex === q.correctAnswer;

            return (
              <div 
                key={q.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 transition-colors shadow-sm ${
                  isCorrect 
                    ? "border-slate-200 dark:border-slate-800" 
                    : "border-red-200 dark:border-red-900/50 bg-red-50/10 dark:bg-red-900/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center ${
                    isCorrect
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-slate-900 dark:text-white font-medium text-lg leading-relaxed">
                      {q.question}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-3 rounded-lg border ${
                        isCorrect
                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20"
                          : "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20"
                      }`}>
                        <span className={`text-xs font-bold uppercase tracking-wider mb-1 block ${
                          isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        }`}>Jawaban Anda</span>
                        <span className="text-slate-700 dark:text-slate-200">{q.options[userAnswerIndex] || "Tidak dijawab"}</span>
                      </div>
                      
                      {!isCorrect && (
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 block">Jawaban Benar</span>
                          <span className="text-slate-700 dark:text-slate-200">{q.options[q.correctAnswer]}</span>
                        </div>
                      )}
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
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
