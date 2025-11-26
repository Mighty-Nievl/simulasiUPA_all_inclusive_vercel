// Progress management utilities for gamification system

export interface Progress {
  completedSessions: number[];
  currentSession: number;
  lastUpdated: string;
  masteredQuestionIds: number[];
  sessionQuestions: { [sessionId: number]: number[] };
  currentAnswers: { [sessionId: number]: { [questionId: number]: number } };
}

const PROGRESS_KEY = 'upa_progress';

/**
 * Get user progress from localStorage
 */
export function getProgress(): Progress {
  if (typeof window === 'undefined') {
    return { 
      completedSessions: [], 
      currentSession: 1, 
      lastUpdated: new Date().toISOString(),
      masteredQuestionIds: [],
      sessionQuestions: {},
      currentAnswers: {}
    };
  }

  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) {
    return { 
      completedSessions: [], 
      currentSession: 1, 
      lastUpdated: new Date().toISOString(),
      masteredQuestionIds: [],
      sessionQuestions: {},
      currentAnswers: {}
    };
  }

  try {
    const parsed = JSON.parse(stored);
    // Ensure new fields exist for backward compatibility
    return {
      completedSessions: parsed.completedSessions || [],
      currentSession: parsed.currentSession || 1,
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      masteredQuestionIds: parsed.masteredQuestionIds || [],
      sessionQuestions: parsed.sessionQuestions || {},
      currentAnswers: parsed.currentAnswers || {}
    };
  } catch {
    return { 
      completedSessions: [], 
      currentSession: 1, 
      lastUpdated: new Date().toISOString(),
      masteredQuestionIds: [],
      sessionQuestions: {},
      currentAnswers: {}
    };
  }
}

/**
 * Save progress after completing a session
 */
export function saveProgress(sessionId: number, correctQuestionIds: number[] = []): void {
  if (typeof window === 'undefined') return;

  const progress = getProgress();
  
  // Add to completed sessions if not already there
  if (!progress.completedSessions.includes(sessionId)) {
    progress.completedSessions.push(sessionId);
    progress.completedSessions.sort((a, b) => a - b);
  }

  // Add correct questions to mastered list
  const newMastered = new Set([...progress.masteredQuestionIds, ...correctQuestionIds]);
  progress.masteredQuestionIds = Array.from(newMastered);

  // Update current session to next unlocked session
  progress.currentSession = Math.min(sessionId + 1, 20);
  progress.lastUpdated = new Date().toISOString();

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  
  // Trigger background sync
  syncProgressWithDB();
}

/**
 * Save assigned questions for a session
 */
export function saveSessionQuestions(sessionId: number, questionIds: number[]): void {
  if (typeof window === 'undefined') return;

  const progress = getProgress();
  progress.sessionQuestions[sessionId] = questionIds;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

/**
 * Get assigned questions for a session
 */
export function getSessionQuestions(sessionId: number): number[] | null {
  const progress = getProgress();
  return progress.sessionQuestions[sessionId] || null;
}

/**
 * Save current answers for a session
 */
export function saveCurrentAnswers(sessionId: number, answers: { [questionId: number]: number }): void {
  if (typeof window === 'undefined') return;

  const progress = getProgress();
  progress.currentAnswers[sessionId] = answers;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

/**
 * Get current answers for a session
 */
export function getCurrentAnswers(sessionId: number): { [questionId: number]: number } | null {
  const progress = getProgress();
  return progress.currentAnswers[sessionId] || null;
}

/**
 * Clear current answers for a session
 */
export function clearCurrentAnswers(sessionId: number): void {
  if (typeof window === 'undefined') return;

  const progress = getProgress();
  if (progress.currentAnswers[sessionId]) {
    delete progress.currentAnswers[sessionId];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }
}

/**
 * Reset all progress
 */
export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(PROGRESS_KEY);
}

/**
 * Get the next unlocked session
 */
export function getUnlockedSession(): number {
  const progress = getProgress();
  return progress.currentSession;
}

/**
 * Check if a session is unlocked
 */
export function isSessionUnlocked(sessionId: number): boolean {
  const progress = getProgress();
  
  // Session 1 is always unlocked
  if (sessionId === 1) return true;
  
  // A session is unlocked if the previous session is completed
  return progress.completedSessions.includes(sessionId - 1);
}

/**
 * Check if a session is completed
 */
export function isSessionCompleted(sessionId: number): boolean {
  const progress = getProgress();
  return progress.completedSessions.includes(sessionId);
}
/**
 * Sync progress with database (Hybrid approach)
 */
export async function syncProgressWithDB(): Promise<void> {
  if (typeof window === 'undefined') return;

  const localProgress = getProgress();

  try {
    const response = await fetch('/api/progress/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localProgress),
    });

    if (response.ok) {
      const data = await response.json();
      
      // If server has newer data, update local
      if (data.action === 'update_local' && data.progress) {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(data.progress));
        // Dispatch event to notify components
        window.dispatchEvent(new Event('storage'));
      }
    }
  } catch (error) {
    console.error('Failed to sync progress:', error);
    // Silent fail - offline mode will persist local data
  }
}
