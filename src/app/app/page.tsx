"use client";

import { useState, useEffect } from "react";
import {
  getProgress,
  isSessionUnlocked,
  isSessionCompleted,
  resetProgress,
} from "@/lib/progress";
import { createClient } from "@/lib/supabase/client";
import { SITE_CONFIG } from "@/lib/config";
import ExamSimulation from "@/components/ExamSimulation";

export default function Home() {
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [progress, setProgress] = useState<{
    completedSessions: number[];
    currentSession: number;
  }>({ completedSessions: [], currentSession: 1 });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = SITE_CONFIG.loginUrl;
        return;
      }
      setIsCheckingAuth(false);
    };
    
    checkAuth();

    const currentProgress = getProgress();
    setProgress(currentProgress);
    
    // Auto-start the current session
    if (!selectedSession) {
      setSelectedSession(currentProgress.currentSession);
    }
    
    // Check local storage or system preference
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      setDarkMode(savedMode === "true");
      if (savedMode === "true") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Default to dark mode for this app style
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleStartExam = () => {
    setSelectedSession(1);
  };

  const handleExitSession = () => {
    setSelectedSession(null);
    setProgress(getProgress());
  };

  const handleNextSession = () => {
    if (selectedSession && selectedSession < 20) {
      setSelectedSession(selectedSession + 1);
      setProgress(getProgress());
    }
  };

  const handleResetProgress = () => {
    resetProgress();
    setProgress({ completedSessions: [], currentSession: 1 });
    setShowResetConfirm(false);
    fetch("/api/reset", { method: "POST" });
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
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  // Render a simple loading state or nothing while auto-starting
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
