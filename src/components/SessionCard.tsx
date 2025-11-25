'use client';

interface SessionCardProps {
  sessionId: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export default function SessionCard({ sessionId, isUnlocked, isCompleted, onClick }: SessionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!isUnlocked}
      className={`
        relative p-5 rounded-lg border-2 transition-all duration-200
        ${isCompleted 
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-600' 
          : isUnlocked
          ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-emerald-500 hover:shadow-md'
          : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-50 cursor-not-allowed'
        }
      `}
    >
      {/* Status Icon - Top Right */}
      <div className="absolute top-2 right-2 text-lg">
        {isCompleted ? '⭐' : isUnlocked ? '✅' : '🔒'}
      </div>

      {/* Session Number */}
      <div className="text-center mt-1">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sesi</div>
        <div className={`text-2xl font-bold ${
          isCompleted 
            ? 'text-emerald-600 dark:text-emerald-400' 
            : isUnlocked 
            ? 'text-gray-900 dark:text-gray-100' 
            : 'text-gray-400 dark:text-gray-600'
        }`}>
          {sessionId}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          10 Soal
        </div>
      </div>

      {/* Status Badge */}
      {isCompleted && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
            Selesai
          </div>
        </div>
      )}
    </button>
  );
}
