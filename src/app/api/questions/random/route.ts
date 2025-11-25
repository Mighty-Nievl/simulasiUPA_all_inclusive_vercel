import { NextRequest, NextResponse } from 'next/server';
import rawQuestions from '@/data/questions.json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { excludeIds = [], count = 10 } = body;

    // Filter out excluded questions and duplicates
    const uniqueContent = new Set();
    const availableQuestions = rawQuestions.filter((q: any) => {
      if (excludeIds.includes(q.id_soal)) return false;
      if (uniqueContent.has(q.pertanyaan)) return false;
      uniqueContent.add(q.pertanyaan);
      return true;
    });

    // Shuffle available questions
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());

    // Select requested number of questions
    const selectedQuestions = shuffled.slice(0, count).map((q: any) => ({
      id: q.id_soal,
      topic: q.materi,
      question: q.pertanyaan,
      options: [q.pilihan_a, q.pilihan_b, q.pilihan_c, q.pilihan_d],
      correctAnswer: q.kunci_jawaban.charCodeAt(0) - 'A'.charCodeAt(0),
      explanation: q.penjelasan
    }));

    return NextResponse.json({
      questions: selectedQuestions,
      totalAvailable: availableQuestions.length
    });
  } catch (error) {
    console.error('Error fetching random questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random questions' },
      { status: 500 }
    );
  }
}
