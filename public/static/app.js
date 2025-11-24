// =======================
// Utility: AJAX Helper
// =======================

async function apiGet(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status} → ${text}`);
        }
        return await res.json();
    } catch (err) {
        console.error("API GET ERROR:", err);
        throw err;
    }
}

async function apiPost(url, body) {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status} → ${text}`);
        }
        return await res.json();
    } catch (err) {
        console.error("API POST ERROR:", err);
        throw err;
    }
}

// =======================
// Load Progress
// =======================

async function loadProgress() {
    try {
        const data = await apiGet("/api/progress");
        window.currentSession = data.current_session;
        console.log("Progress loaded:", data);
    } catch (err) {
        console.error("Error loading progress:", err);
        alert("Terjadi kesalahan saat memuat progress.");
    }
}

document.addEventListener("DOMContentLoaded", loadProgress);

// =======================
// Load Questions
// =======================

async function loadQuestions(sessionId) {
    try {
        const url = `/api/session?session_id=${sessionId}`;
        console.log("Fetching:", url);

        const data = await apiGet(url);
        console.log("Session data:", data);

        return data.questions;
    } catch (err) {
        console.error("Error loading questions:", err);
        alert("Terjadi kesalahan saat memuat soal.");
        throw err;
    }
}

// =======================
// Submit Answers
// =======================

async function submitAnswers(sessionId, answers) {
    try {
        const data = await apiPost("/api/submit", {
            session_id: sessionId,
            answers: answers
        });

        console.log("Submit result:", data);

        return data;
    } catch (err) {
        console.error("Submit error:", err);
        alert("Terjadi kesalahan saat mengirim jawaban.");
        throw err;
    }
}

// =======================
// Reset Progress
// =======================

async function resetProgress() {
    try {
        await apiPost("/api/reset", {});
        alert("Progress berhasil direset.");
        window.location.reload();
    } catch (err) {
        console.error("Error resetting progress:", err);
        alert("Terjadi kesalahan saat mereset progress.");
    }
}
