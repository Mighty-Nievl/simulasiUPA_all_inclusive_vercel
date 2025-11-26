import { NextRequest, NextResponse } from 'next/server';
import rawQuestions from '@/data/questions.json';
import { createClient } from '@/lib/supabase/server';

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

    // Get questions based on submitted answer IDs
    const questionIds = Object.keys(answers).map(id => parseInt(id));
    const sessionQuestions = rawQuestions.filter((q: any) => questionIds.includes(q.id_soal));

    if (sessionQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No matching questions found' },
        { status: 400 }
      );
    }

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
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Save to database if user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('exam_results').insert({
        user_id: user.id,
        session_id: sessionId,
        score: score,
        total_questions: totalQuestions,
        correct_answers: correctCount,
        incorrect_answers: totalQuestions - correctCount,
        answers: answers
      });
    }

    return NextResponse.json({
      success: passed,
      correctCount,
      totalQuestions,
      percentage: score,
      results,
      message: passed
        ? `Sempurna! Anda menjawab semua soal dengan benar. Sesi ${sessionId + 1} telah terbuka!`
        : `Anda menjawab ${correctCount} dari ${totalQuestions} soal dengan benar. Harus 100% untuk melanjutkan.`
    });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
