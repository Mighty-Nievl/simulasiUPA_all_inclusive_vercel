// Progress management utilities for gamification system

export interface Progress {
  completedSessions: number[];
  currentSession: number;
  lastUpdated: string;
}

const PROGRESS_KEY = 'upa_progress';

/**
 * Get user progress from localStorage
 */
export function getProgress(): Progress {
  if (typeof window === 'undefined') {
    return { completedSessions: [], currentSession: 1, lastUpdated: new Date().toISOString() };
  }

  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) {
    return { completedSessions: [], currentSession: 1, lastUpdated: new Date().toISOString() };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { completedSessions: [], currentSession: 1, lastUpdated: new Date().toISOString() };
  }
}

/**
 * Save progress after completing a session
 */
export function saveProgress(sessionId: number): void {
  if (typeof window === 'undefined') return;

  const progress = getProgress();
  
  // Add to completed sessions if not already there
  if (!progress.completedSessions.includes(sessionId)) {
    progress.completedSessions.push(sessionId);
    progress.completedSessions.sort((a, b) => a - b);
  }

  // Update current session to next unlocked session
  progress.currentSession = Math.min(sessionId + 1, 20);
  progress.lastUpdated = new Date().toISOString();

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
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
