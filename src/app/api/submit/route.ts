import { NextRequest, NextResponse } from 'next/server';
import rawQuestions from '@/data/questions.json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, answers } = body;

    // Validate input
    if (!session_id || !answers) {
      return NextResponse.json(
        { error: 'Missing session_id or answers' },
        { status: 400 }
      );
    }

    const sessionId = parseInt(session_id);
    if (isNaN(sessionId) || sessionId < 1 || sessionId > 20) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    // Get questions for this session
    const startIndex = (sessionId - 1) * 10;
    const endIndex = sessionId * 10;
    const sessionQuestions = rawQuestions.slice(startIndex, endIndex);

    // Validate answers
    const results: { [key: string]: boolean } = {};
    let correctCount = 0;

    sessionQuestions.forEach((q: any, index: number) => {
      const questionId = q.id_soal.toString();
      const userAnswer = answers[questionId];
      const correctAnswer = q.kunci_jawaban;

      const isCorrect = userAnswer === correctAnswer;
      results[questionId] = isCorrect;

      if (isCorrect) {
        correctCount++;
      }
    });

    const totalQuestions = sessionQuestions.length;
    const passed = correctCount === totalQuestions; // 100% accuracy required

    return NextResponse.json({
      success: passed,
      correctCount,
      totalQuestions,
      percentage: (correctCount / totalQuestions) * 100,
      results,
      message: passed
        ? `Sempurna! Anda menjawab semua soal dengan benar. Sesi ${sessionId + 1} telah terbuka!`
        : `Anda menjawab ${correctCount} dari ${totalQuestions} soal dengan benar. Harus 100% untuk melanjutkan.`
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
