const API_URL = "/api";

// State
let currentSession = 1;
let currentQuestions = [];
let userAnswers = {};
let currentQuestionIndex = 0;

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  loadProgress();
});

// Load user progress
async function loadProgress() {
  try {
    const response = await fetch(`${API_URL}/progress`);
    const data = await response.json();
    currentSession = data.current_session;
    updateProgressBar();
  } catch (error) {
    console.error("Error loading progress:", error);
  }
}

// Start exam
async function startExam() {
  try {
    const response = await fetch(`/api/session?session_id=${currentSession}`);
    const data = await response.json();

    if (response.ok) {
      currentQuestions = data.questions;
      userAnswers = {};
      currentQuestionIndex = 0;
      renderQuestions();
      updateSessionInfo(currentSession);
      document.getElementById("welcomeScreen").classList.add("hidden");
      document.getElementById("examScreen").classList.remove("hidden");

      // Add exam-active class to body for sidebar layout
      document.body.classList.add("exam-active");
      document.body.classList.remove("result-active");
    } else {
      alert(data.message || "Gagal memuat soal");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan saat memuat soal");
  }
}

// Save answer
function saveAnswer(questionId, answer) {
  userAnswers[questionId] = answer;
}

// Render questions - ONE AT A TIME
function renderQuestions() {
  const container = document.getElementById("questionsContainer");
  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const container = document.getElementById("questionsContainer");
  container.innerHTML = "";

  const q = currentQuestions[currentQuestionIndex];

  // Update session info with badge and topic
  updateSessionInfoWithQuestion(q);

  const questionCard = document.createElement("div");
  questionCard.className = "question-card single-question";

  questionCard.innerHTML = `
        <div class="question-text">${q.pertanyaan}</div>
        <div class="options">
            ${["A", "B", "C", "D"]
              .map(
                (option) => `
                <div class="option">
                    <input type="radio" 
                           id="q${q.id_soal}_${option}" 
                           name="q${q.id_soal}" 
                           value="${option}"
                           ${userAnswers[q.id_soal] === option ? "checked" : ""}
                           onchange="saveAnswer(${q.id_soal}, '${option}')">
                    <label for="q${q.id_soal}_${option}">
                        ${option}. ${q["pilihan_" + option.toLowerCase()]}
                    </label>
                </div>
            `
              )
              .join("")}
        </div>
        
        <div class="question-navigation">
            <button type="button" class="btn btn-secondary" 
                    onclick="previousQuestion()" 
                    ${currentQuestionIndex === 0 ? "disabled" : ""}>
                ← Soal Sebelumnya
            </button>
            
            <div class="question-indicator">
                ${Array.from(
                  { length: 10 },
                  (_, i) => `
                    <span class="indicator-dot ${
                      i === currentQuestionIndex ? "active" : ""
                    } ${
                    userAnswers[currentQuestions[i].id_soal] ? "answered" : ""
                  }"
                          onclick="goToQuestion(${i})">${i + 1}</span>
                `
                ).join("")}
            </div>
            
            ${
              currentQuestionIndex < 9
                ? `
                <button type="button" class="btn btn-primary" onclick="nextQuestion()">
                    Soal Selanjutnya →
                </button>
            `
                : `
                <button type="submit" class="btn btn-primary btn-submit-final">
                    Kirim Semua Jawaban
                </button>
            `
            }
        </div>
    `;

  container.appendChild(questionCard);
}

function updateSessionInfoWithQuestion(q) {
  const sessionTitle = document.getElementById("sessionTitle");
  const sessionDesc = document.getElementById("sessionDesc");

  // Check if structure exists
  let sessionInfoRight = document.querySelector(".session-info-right");

  if (!sessionInfoRight) {
    const sessionInfo = document.querySelector(".session-info");
    sessionInfoRight = document.createElement("div");
    sessionInfoRight.className = "session-info-right";
    sessionInfo.appendChild(sessionInfoRight);
  }

  sessionInfoRight.innerHTML = `
        <div class="question-badge" id="questionBadge">Soal ${
          currentQuestionIndex + 1
        } dari 10</div>
        <div class="question-topic-badge" id="questionTopic">${q.materi}</div>
    `;
}

function nextQuestion() {
  if (currentQuestionIndex < 9) {
    currentQuestionIndex++;
    renderCurrentQuestion();
    scrollToTop();
  }
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderCurrentQuestion();
    scrollToTop();
  }
}

function goToQuestion(index) {
  currentQuestionIndex = index;
  renderCurrentQuestion();
  scrollToTop();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Submit answers
document.getElementById("examForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Check if all questions answered
  if (Object.keys(userAnswers).length < 10) {
    alert("Mohon jawab semua soal sebelum mengirim!");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: currentSession,
        answers: userAnswers,
      }),
    });

    const data = await response.json();
    showResults(data);
  } catch (error) {
    console.error("Error submitting answers:", error);
    alert("Gagal mengirim jawaban. Pastikan server berjalan.");
  }
});

// Show results
function showResults(data) {
  document.getElementById("examScreen").classList.add("hidden");
  document.getElementById("resultScreen").classList.remove("hidden");

  // Add result-active class to body for sidebar layout
  document.body.classList.add("result-active");
  document.body.classList.remove("exam-active");

  const resultCard = document.getElementById("resultCard");

  if (data.passed) {
    resultCard.innerHTML = `
            <div class="text-center">
                <div class="result-icon">🎉</div>
                <h2>Selamat! Anda Lulus!</h2>
                <p class="result-message">Anda berhasil menjawab semua soal dengan benar!</p>
                <div class="score-display">
                    <h3>${data.score} / ${data.total}</h3>
                    <p>Skor: 100%</p>
                </div>
                ${
                  data.next_session <= 20
                    ? `
                    <button class="btn btn-primary" onclick="nextSession(${data.next_session})">
                        Lanjut ke Sesi ${data.next_session}
                    </button>
                `
                    : `
                    <p style="font-size: 1.2rem; margin: 20px 0;">
                        🏆 Selamat! Anda telah menyelesaikan semua 200 soal!
                    </p>
                    <button class="btn btn-primary" onclick="backToHome()">
                        Kembali ke Beranda
                    </button>
                `
                }
            </div>
        `;
  } else {
    // Show all answers with explanations
    let reviewHtml = '<div class="review-section"><h3>📚 Pembahasan Soal:</h3>';
    data.results.forEach((result, index) => {
      const question = currentQuestions[index];
      const isCorrect = result.correct;

      reviewHtml += `
                <div class="explanation-card ${
                  isCorrect ? "correct" : "incorrect"
                }">
                    <div class="explanation-header">
                        <strong>${isCorrect ? "✅" : "❌"} Soal ${
        index + 1
      }</strong>
                        <span class="question-topic-small">${
                          question.materi
                        }</span>
                    </div>
                    <div class="explanation-question">${
                      question.pertanyaan
                    }</div>
                    <div class="explanation-answers">
                        <div class="answer-row ${
                          isCorrect ? "correct" : "wrong"
                        }">
                            <span class="answer-label">Jawaban Anda:</span>
                            <span class="answer-value">${
                              result.user_answer || "Tidak dijawab"
                            } ${isCorrect ? "✓" : "✗"}</span>
                        </div>
                        ${
                          !isCorrect
                            ? `
                            <div class="answer-row correct">
                                <span class="answer-label">Jawaban Benar:</span>
                                <span class="answer-value">${
                                  result.correct_answer
                                }. ${
                                question[
                                  "pilihan_" +
                                    result.correct_answer.toLowerCase()
                                ]
                              }</span>
                            </div>
                        `
                            : ""
                        }
                    </div>
                    ${
                      question.penjelasan
                        ? `
                        <div class="explanation-text">
                            <strong>💡 Penjelasan:</strong><br>
                            ${question.penjelasan}
                        </div>
                    `
                        : ""
                    }
                </div>
            `;
    });
    reviewHtml += "</div>";

    resultCard.innerHTML = `
            <div class="text-center">
                <div class="result-icon">😔</div>
                <h2>Belum Berhasil</h2>
                <p class="result-message">Anda harus menjawab 100% benar untuk melanjutkan.</p>
                <div class="score-display">
                    <h3>${data.score} / ${data.total}</h3>
                    <p>Skor: ${((data.score / data.total) * 100).toFixed(
                      0
                    )}%</p>
                </div>
                
                <button class="btn btn-retry" onclick="retrySession()">
                    🔄 Ulangi Sesi Ini
                </button>
                
                ${reviewHtml}
                
                <button class="btn btn-secondary" onclick="backToHome()">
                    Kembali ke Beranda
                </button>
            </div>
        `;
  }
}

// Next session
async function nextSession(sessionId) {
  currentSession = sessionId;
  updateProgressBar();
  document.getElementById("resultScreen").classList.add("hidden");
  document.getElementById("examScreen").classList.remove("hidden");
  await loadSession(sessionId);
}

// Load session
async function loadSession(sessionId) {
  try {
    const response = await fetch(`/api/session?session_id=${sessionId}`);
    const data = await response.json();

    if (response.ok) {
      currentQuestions = data.questions;
      userAnswers = {};
      currentQuestionIndex = 0;
      renderQuestions();
      updateSessionInfo(sessionId);
    }
  } catch (error) {
    console.error("Error loading session:", error);
  }
}

// Retry session
async function retrySession() {
  document.getElementById("resultScreen").classList.add("hidden");
  document.getElementById("examScreen").classList.remove("hidden");

  // Remove sidebar retry button
  const sidebarRetryBtn = document.getElementById("sidebarRetryBtn");
  if (sidebarRetryBtn) sidebarRetryBtn.remove();

  await loadSession(currentSession);
}

// Back to home
function backToHome() {
  document.getElementById("resultScreen").classList.add("hidden");
  document.getElementById("examScreen").classList.add("hidden");
  document.getElementById("welcomeScreen").classList.remove("hidden");

  // Remove layout classes from body
  document.body.classList.remove("exam-active", "result-active");

  // Remove sidebar retry button
  const sidebarRetryBtn = document.getElementById("sidebarRetryBtn");
  if (sidebarRetryBtn) sidebarRetryBtn.remove();

  loadProgress();
}

// Update progress bar
function updateProgressBar() {
  const progress = ((currentSession - 1) / 20) * 100;
  document.getElementById("progressFill").style.width = `${progress}%`;
  document.getElementById(
    "progressText"
  ).textContent = `Sesi ${currentSession} dari 20`;
}

// Update session info
function updateSessionInfo(sessionId) {
  document.getElementById(
    "sessionTitle"
  ).textContent = `Sesi ${sessionId} - 10 Soal`;
  const startQ = (sessionId - 1) * 10 + 1;
  const endQ = sessionId * 10;
  document.getElementById(
    "sessionDesc"
  ).textContent = `Soal ${startQ} - ${endQ} | Jawab semua dengan benar untuk melanjutkan`;
}

// Reset progress
async function resetProgress() {
  if (!confirm("Apakah Anda yakin ingin mereset semua progress?")) {
    return;
  }

  try {
    await fetch(`${API_URL}/reset`, { method: "POST" });
    currentSession = 1;
    updateProgressBar();
    alert("Progress berhasil direset!");
  } catch (error) {
    console.error("Error resetting progress:", error);
    alert("Gagal mereset progress.");
  }
}

// Custom Alert Logic
window.alert = function (message) {
  const alertOverlay = document.getElementById("customAlert");
  const alertMessage = document.getElementById("customAlertMessage");

  if (alertOverlay && alertMessage) {
    alertMessage.textContent = message;
    alertOverlay.classList.remove("hidden");
  } else {
    console.log("Custom alert elements not found, falling back to console");
    console.log(message);
  }
};

function closeCustomAlert() {
  const alertOverlay = document.getElementById("customAlert");
  if (alertOverlay) {
    alertOverlay.classList.add("hidden");
  }
}

// Dark Mode Logic
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark-mode");

  // Save preference
  const isDarkMode = body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode);
}

// Initialize Dark Mode
document.addEventListener("DOMContentLoaded", () => {
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  const darkModeSwitch = document.getElementById("darkModeSwitch");

  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    if (darkModeSwitch) darkModeSwitch.checked = true;
  }
});

// Keyboard Shortcuts for Exam
document.addEventListener("keydown", (e) => {
  // Only activate shortcuts during exam
  const examScreen = document.getElementById("examScreen");
  if (!examScreen || examScreen.classList.contains("hidden")) {
    return;
  }

  // Prevent shortcuts if typing in input field
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    return;
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];
  if (!currentQuestion) return;

  // Number keys 1-4 for answers A-D
  if (e.key >= "1" && e.key <= "4") {
    e.preventDefault();
    const options = ["A", "B", "C", "D"];
    const selectedOption = options[parseInt(e.key) - 1];

    // Select the radio button
    const radioButton = document.getElementById(
      `q${currentQuestion.id_soal}_${selectedOption}`
    );
    if (radioButton) {
      radioButton.checked = true;
      saveAnswer(currentQuestion.id_soal, selectedOption);

      // Visual feedback
      radioButton.parentElement.style.background = "var(--gray-100)";
      setTimeout(() => {
        radioButton.parentElement.style.background = "";
      }, 200);
    }
  }

  // Enter key for next question or submit
  if (e.key === "Enter") {
    e.preventDefault();
    if (currentQuestionIndex < 9) {
      nextQuestion();
    } else {
      // Submit on last question
      const submitButton = document.querySelector(".btn-submit-final");
      if (submitButton) {
        submitButton.click();
      }
    }
  }

  // Backspace for previous question
  if (e.key === "Backspace") {
    e.preventDefault();
    if (currentQuestionIndex > 0) {
      previousQuestion();
    }
  }

  // Arrow keys as alternative
  if (e.key === "ArrowRight") {
    e.preventDefault();
    if (currentQuestionIndex < 9) {
      nextQuestion();
    }
  }

  if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (currentQuestionIndex > 0) {
      previousQuestion();
    }
  }
});
