# Simulasi UPA - Vercel Ready (All-Inclusive, Modern Tailwind)

This project is a converted version of the original Flask app into:
- Serverless Node.js API (Vercel)
- Static frontend in `/public` (Tailwind via CDN)
- `bank_soal.json` kept as source of questions

How to deploy:
1. Upload this project to a Git repo.
2. On Vercel, import the repo and deploy (no build step needed).
3. The serverless endpoints live under `/api/*`.

APIs:
- GET /api/session?session_id=1
- POST /api/submit  { session_id, answers }
- GET /api/progress
- POST /api/reset

