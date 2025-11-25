import { NextRequest, NextResponse } from 'next/server';
import rawQuestions from '@/data/questions.json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionIds = [] } = body;

    if (!questionIds.length) {
      return NextResponse.json({ questions: [] });
    }

    // Find requested questions
    // Optimize: Create a map for faster lookup if needed, but for small batches filter is fine
    const selectedQuestions = rawQuestions
      .filter((q: any) => questionIds.includes(q.id_soal))
      .map((q: any) => ({
        id: q.id_soal,
        topic: q.materi,
        question: q.pertanyaan,
        options: [q.pilihan_a, q.pilihan_b, q.pilihan_c, q.pilihan_d],
        correctAnswer: q.kunci_jawaban.charCodeAt(0) - 'A'.charCodeAt(0),
        explanation: q.penjelasan
      }));

    // Sort them in the order of requested IDs to maintain shuffle if client sent shuffled list
    // OR just return them and let client handle order. 
    // Actually, the client might expect them in the order provided if it's restoring a session.
    // Let's sort by the input array order.
    const orderedQuestions = selectedQuestions.sort((a, b) => {
      return questionIds.indexOf(a.id) - questionIds.indexOf(b.id);
    });

    return NextResponse.json({
      questions: orderedQuestions
    });
  } catch (error) {
    console.error('Error fetching batch questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch questions' },
      { status: 500 }
    );
  }
}
