let user_progress = {
  current_session: 1,
  completed_sessions: []
};

export default function handler(req, res) {
  return res.status(200).json(user_progress);
}
