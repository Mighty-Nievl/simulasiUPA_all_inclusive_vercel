import fs from 'fs';

export default function handler(req, res) {
  const { session_id } = req.query;

  const id = parseInt(session_id);
  if (!id || id < 1 || id > 20) {
    return res.status(400).json({ error: "Invalid session" });
  }

  const data = JSON.parse(fs.readFileSync('bank_soal.json', 'utf-8'));

  const start = (id - 1) * 10;
  const end = start + 10;
  const questions = data.slice(start, end).map(q => {
    const copy = { ...q };
    delete copy.kunci_jawaban;
    return copy;
  });

  return res.status(200).json({
    session_id: id,
    questions,
    total_sessions: Math.ceil(data.length/10)
  });
}
