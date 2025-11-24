import fs from 'fs';

let user_progress = {
  current_session: 1,
  completed_sessions: []
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { session_id, answers } = req.body;

  if (!session_id || !answers) {
    return res.status(400).json({ error: "Missing data" });
  }

  const data = JSON.parse(fs.readFileSync('bank_soal.json', 'utf-8'));

  const start = (session_id - 1) * 10;
  const end = start + 10;
  const session_questions = data.slice(start, end);

  let correct_count = 0;
  const results = [];

  for (const q of session_questions) {
    const user_answer = answers[String(q.id_soal)];
    const is_correct = user_answer === q.kunci_jawaban;

    if (is_correct) correct_count++;

    results.push({
      id_soal: q.id_soal,
      correct: is_correct,
      user_answer,
      correct_answer: q.kunci_jawaban
    });
  }

  const passed = correct_count === session_questions.length;

  if (passed && !user_progress.completed_sessions.includes(session_id)) {
    user_progress.completed_sessions.push(session_id);

    if (session_id === user_progress.current_session) {
      user_progress.current_session = Math.min(user_progress.current_session+1, Math.ceil(data.length/10));
    }
  }

  return res.status(200).json({
    passed,
    score: correct_count,
    total: session_questions.length,
    results,
    next_session: passed ? user_progress.current_session : session_id
  });
}
