import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryName = urlParams.get("categoryName");
  const dayIndex = urlParams.get("day");

  const quizTitle = document.getElementById("quiz-title");
  const quizOptionsContainer = document.getElementById("quiz-options");
  const progressBar = document.getElementById("progress-bar");
  const nextButton = document.getElementById("quiz-next-button");
  const feedback = document.getElementById("quiz-feedback");

  let quizzes = [];
  let currentQuestionIndex = 0;
  let selectedAnswer = null;
  let isAnswered = false;

  if (!categoryName || !dayIndex) {
    alert("잘못된 접근입니다.");
    return;
  }

  try {
    const response = await authorizedFetch(
      `http://43.202.211.168:8080/api/terms/quiz/batch?categoryName=${encodeURIComponent(
        categoryName
      )}&dayIndex=${dayIndex}`,
      { method: "GET" }
    );

    quizzes = await response.json();

    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      alert("퀴즈가 없습니다.");
      return;
    }

    renderQuestion(currentQuestionIndex);
  } catch (err) {
    console.error("퀴즈 로딩 실패:", err);
    alert("퀴즈를 불러오는 데 실패했습니다.");
  }

  function renderQuestion(index) {
    const quiz = quizzes[index];
    quizTitle.textContent = `Q${index + 1}. ${quiz.question}`;
    quizOptionsContainer.innerHTML = "";
    if (feedback) {
      feedback.textContent = "";
      feedback.className = "feedback";
    }
    nextButton.textContent = "정답 확인";
    nextButton.disabled = true;
    nextButton.style.backgroundColor = "gray";

    quiz.choices.forEach((choice, i) => {
      const btn = document.createElement("button");
      btn.textContent = `${["①", "②", "③", "④"][i]} ${choice}`;
      btn.classList.add("quiz-option");
      btn.dataset.index = i;

      btn.addEventListener("click", () => {
        if (isAnswered) return;
        document.querySelectorAll(".quiz-option").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedAnswer = i;
        nextButton.disabled = false;
        nextButton.style.backgroundColor = "#5DC29E";
      });

      quizOptionsContainer.appendChild(btn);
    });

    updateProgressBar();
  }

  function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / quizzes.length) * 100;
    progressBar.style.width = `${progress}%`;
  }

  function showModal(message) {
    const backdrop = document.createElement("div");
    backdrop.classList.add("modal-backdrop");

    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
      <div class="modal-content">
        <p class="modal-message">${message}</p>
        <div class="modal-buttons">
          <button id="modal-confirm" class="modal-button">확인</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    document.getElementById("modal-confirm").addEventListener("click", closeModal);
  }

  function closeModal() {
    const modal = document.querySelector(".modal");
    const backdrop = document.querySelector(".modal-backdrop");
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
  }

  nextButton.addEventListener("click", async () => {
    const quiz = quizzes[currentQuestionIndex];

    if (!isAnswered) {
      if (selectedAnswer === null) return;

      try {
        const submitPayload = {
        categoryName: categoryName,
        dayIndex: parseInt(dayIndex),
        answers: [
          {
            quizId: quiz.quizId,
            selectedAnswer: selectedAnswer.toString() // ✅ 문자열로!
          }
        ]
      };


        console.log("제출 payload:", submitPayload);

        const response = await authorizedFetch("http://43.202.211.168:8080/api/terms/quiz/submit", {
          method: "POST",
          body: JSON.stringify(submitPayload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("서버 오류 응답:", errorText);
          throw new Error("서버 오류 발생");
        }

        const resultList = await response.json();

        if (!Array.isArray(resultList) || resultList.length === 0) {
          console.error("서버 응답이 비어 있음 또는 예상과 다름:", resultList);
          alert("정답 결과를 불러오지 못했습니다.");
          return;
        }

        const result = resultList[0];
        const isCorrect = result.correct; // ✅ 서버 응답에 맞게 이름 수정

        const { correctAnswer, selectedAnswer: selected } = result;

        document.querySelectorAll(".quiz-option").forEach((btn, i) => {
          btn.classList.remove("selected", "correct", "incorrect");
          if (i === correctAnswer) btn.classList.add("correct");
          if (i === selected && i !== correctAnswer) btn.classList.add("incorrect");
        });

        const message = isCorrect ? "✅ 정답입니다!" : "❌ 오답입니다.";
        showModal(message);


        nextButton.textContent = "다음 문제";
        isAnswered = true;
      } catch (err) {
        console.error("정답 제출 실패", err);
        alert("서버와 통신 중 오류가 발생했습니다.");
      }
    } else {
      currentQuestionIndex++;
      if (currentQuestionIndex < quizzes.length) {
        renderQuestion(currentQuestionIndex);
        isAnswered = false;
        selectedAnswer = null;
      } else {
        const quizResults = quizzes.map(q => ({
          correct: q.userAnswerIndex === q.correctIndex
        }));
        localStorage.setItem("quizResults", JSON.stringify(quizResults));
        window.location.href = "/pages/vocabulary_quiz_result.html";
      }
    }
  });
});
