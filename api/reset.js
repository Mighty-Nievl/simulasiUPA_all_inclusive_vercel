let user_progress = {
  current_session: 1,
  completed_sessions: []
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  user_progress = {
    current_session: 1,
    completed_sessions: []
  };

  return res.status(200).json({ message: "Progress reset" });
}
