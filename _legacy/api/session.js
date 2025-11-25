// api/session.js
import fs from 'fs';

export default function handler(req, res) {
  try {
    const { session_id } = req.query;
    const id = parseInt(session_id);

    if (!id || id < 1) {
      return res.status(400).json({ error: "Invalid or missing session_id" });
    }

    // read bank_soal.json relative to this module (works in Vercel ESM)
    const bankPath = new URL('../bank_soal.json', import.meta.url);
    const raw = fs.readFileSync(bankPath, 'utf-8');
    const data = JSON.parse(raw);

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
      total_sessions: Math.ceil(data.length / 10)
    });
  } catch (err) {
    console.error('session handler error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Internal server error', detail: String(err && err.message ? err.message : err) });
  }
}
