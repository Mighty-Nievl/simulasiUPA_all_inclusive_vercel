import { NextRequest, NextResponse } from 'next/server';
import rawQuestions from '@/data/questions.json';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId: sessionIdStr } = await params;
  const sessionId = parseInt(sessionIdStr);

  // Validate session ID
  if (isNaN(sessionId) || sessionId < 1 || sessionId > 20) {
    return NextResponse.json(
      { error: 'Invalid session ID. Must be between 1 and 20.' },
      { status: 400 }
    );
  }

  // Calculate question range for this session
  const startIndex = (sessionId - 1) * 10;
  const endIndex = sessionId * 10;

  // Get 10 questions for this session
  const sessionQuestions = rawQuestions.slice(startIndex, endIndex).map((q: any) => ({
    id: q.id_soal,
    topic: q.materi,
    question: q.pertanyaan,
    options: [q.pilihan_a, q.pilihan_b, q.pilihan_c, q.pilihan_d],
    correctAnswer: q.kunci_jawaban.charCodeAt(0) - 'A'.charCodeAt(0),
    explanation: q.penjelasan
  }));

  return NextResponse.json({
    sessionId,
    questions: sessionQuestions,
    totalQuestions: sessionQuestions.length
  });
}
