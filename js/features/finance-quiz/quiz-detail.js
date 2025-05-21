import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", () => {
  const quizData = JSON.parse(localStorage.getItem("currentQuizSet")) || [];
  const quizTitle = document.querySelector(".quiz-title");
  const quizOptionsContainer = document.getElementById("quiz-options");
  const progressBar = document.getElementById("progress-bar");
  const nextButton = document.getElementById("quiz-next-button");
  const feedback = document.getElementById("quiz-feedback");
  const hintBox = document.getElementById("hint-box");
  const hintContent = document.getElementById("hint-content");

  // 헤더에 난이도 표시
  const selectedDifficulty = localStorage.getItem("selectedDifficulty");
  const displayMap = {
    "초급": "기초 퀴즈",
    "중급": "심화 퀴즈",
    "고급": "고급 퀴즈"
  };
  const header = document.querySelector("header");
  if (selectedDifficulty && displayMap[selectedDifficulty]) {
    header.innerHTML = `
      <button class="back-button" onclick="history.back();">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 19L8 12L15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      ${displayMap[selectedDifficulty]}
    `;
  }

  let currentQuestionIndex = 0;
  let selectedAnswer = null;
  let isAnswered = false;

  function renderQuestion(index) {
    const quiz = quizData[index];

    quizTitle.textContent = `Q${index + 1}. ${quiz.question}`;
    quizOptionsContainer.innerHTML = "";
    feedback.textContent = "";
    feedback.className = "feedback";
    hintBox.style.display = "none";
    nextButton.textContent = "정답 확인";
    nextButton.disabled = true;
    nextButton.style.backgroundColor = "gray";

    if (hintContent) {
      hintContent.textContent = quiz.hint || "힌트가 없습니다.";
    }

    quiz.options.forEach((option, i) => {
      const button = document.createElement("button");
      button.classList.add("quiz-option");
      button.textContent = `${["①", "②", "③", "④"][i]} ${option}`;
      button.dataset.id = i;

      button.addEventListener("click", () => {
        if (isAnswered) return; // ✅ 이미 정답 확인했으면 클릭 무시

        document.querySelectorAll(".quiz-option").forEach(btn => {
          btn.classList.remove("selected");
        });
        button.classList.add("selected");
        selectedAnswer = i;
        nextButton.disabled = false;
        nextButton.style.backgroundColor = "#5DC29E";
      });



      quizOptionsContainer.appendChild(button);
    });

    updateProgressBar();
  }

  function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
    progressBar.style.width = `${progress}%`;
  }

  window.toggleHint = () => {
    hintBox.style.display = hintBox.style.display === "none" ? "block" : "none";
  };

  function showModal(message, isCorrect) {
    const backdrop = document.createElement("div");
    backdrop.classList.add("modal-backdrop");

    const modal = document.createElement("div");
    modal.classList.add("modal");

    const lines = message.split('\n');
    const resultLine = lines[0]; // "✅ 정답입니다!" or "❌ 오답입니다."
    const explanationLines = lines.slice(1).join("<br>"); // 나머지 해설

    const resultClass = isCorrect ? "result correct" : "result incorrect";

    modal.innerHTML = `
      <div class="modal-content">
        <p class="${resultClass}">${resultLine}</p>
        <p class="explanation">${explanationLines}</p>
        <button class="modal-button">확인</button>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    const modalButton = modal.querySelector(".modal-button");
    modalButton.addEventListener("click", closeModal);
}


  function closeModal() {
    const modal = document.querySelector(".modal");
    const backdrop = document.querySelector(".modal-backdrop");
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
  }

  nextButton.addEventListener("click", async () => {
    const quiz = quizData[currentQuestionIndex];

    if (!isAnswered) {
      if (selectedAnswer === null) return;

      try {
        const response = await authorizedFetch("http://43.202.211.168:8080/api/quiz/submit", {
          method: "POST",
          body: JSON.stringify({
            quiz: quiz,
            userAnswerIndex: selectedAnswer
          })
        });

        const result = await response.json();
        const { correct, explanation } = result.data;

        document.querySelectorAll(".quiz-option").forEach((btn, i) => {
          btn.classList.remove("selected");
          if (i === quiz.correctIndex) btn.classList.add("correct");
          else if (i === selectedAnswer) btn.classList.add("incorrect");
        });

        const message = correct
          ? `✅ 정답입니다!\n\n${explanation || "해설이 없습니다."}`
          : `❌ 오답입니다.\n\n${explanation || "해설이 없습니다."}`;

        showModal(message, correct);

        nextButton.textContent = "다음 문제";
        isAnswered = true;
      } catch (err) {
        console.error("정답 제출 실패", err);
        alert("서버와 통신 중 오류가 발생했습니다.");
      }
    } else {
      currentQuestionIndex++;
      if (currentQuestionIndex < quizData.length) {
        renderQuestion(currentQuestionIndex);
        isAnswered = false;
        selectedAnswer = null;
      } else {
        window.location.href = "/pages/quiz_result.html";
      }
    }
  });

  renderQuestion(currentQuestionIndex);
});
