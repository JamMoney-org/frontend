document.addEventListener("DOMContentLoaded", () => {
  const quizData = JSON.parse(localStorage.getItem("currentQuizSet")) || [];
  const quizTitle = document.querySelector(".quiz-title");
  const quizOptionsContainer = document.getElementById("quiz-options");
  const progressBar = document.getElementById("progress-bar");
  const nextButton = document.getElementById("next-button");
  const feedback = document.getElementById("feedback");
  const hintBox = document.getElementById("hint-box");

  let currentQuestionIndex = 0;
  let selectedAnswer = null;

  // 퀴즈 렌더링
  function renderQuestion(index) {
    const quiz = quizData[index];

    quizTitle.textContent = `Q${index + 1}. ${quiz.question}`;
    quizOptionsContainer.innerHTML = "";
    feedback.textContent = "";
    feedback.className = "feedback";
    hintBox.style.display = "none";
    nextButton.textContent = index === quizData.length - 1 ? "퀴즈 완료" : "다음 문제";

    quiz.options.forEach((option, i) => {
      const button = document.createElement("button");
      button.classList.add("quiz-option");
      button.textContent = `${["①", "②", "③", "④"][i]} ${option}`;
      button.dataset.id = i;

      button.addEventListener("click", () => {
        document.querySelectorAll(".quiz-option").forEach(btn => {
          btn.classList.remove("selected");
        });
        button.classList.add("selected");
        selectedAnswer = i;
      });

      quizOptionsContainer.appendChild(button);
    });

    updateProgressBar();
  }

  // 진행 바 업데이트
  function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
    progressBar.style.width = `${progress}%`;
  }

  // 힌트 토글
  window.toggleHint = () => {
    hintBox.style.display = hintBox.style.display === "none" ? "block" : "none";
  };

  // 다음 버튼 클릭
  nextButton.addEventListener("click", () => {
    const quiz = quizData[currentQuestionIndex];

    if (selectedAnswer === null) {
      alert("정답을 선택해주세요!");
      return;
    }

    const correctIndex = quiz.correctIndex;
    const isCorrect = selectedAnswer === correctIndex;

    document.querySelectorAll(".quiz-option").forEach((btn, i) => {
      btn.classList.remove("selected");
      if (i === correctIndex) {
        btn.classList.add("correct");
      } else if (i === selectedAnswer) {
        btn.classList.add("incorrect");
      }
    });

    feedback.textContent = isCorrect ? "✅ 정답입니다!" : `❌ 오답입니다.`;
    feedback.className = isCorrect ? "feedback correct" : "feedback incorrect";

    nextButton.disabled = true;

    setTimeout(() => {
      nextButton.disabled = false;
      selectedAnswer = null;
      currentQuestionIndex++;

      if (currentQuestionIndex < quizData.length) {
        renderQuestion(currentQuestionIndex);
      } else {
        window.location.href = "/pages/quiz_result.html";
      }
    }, 1200);
  });

  // 첫 문제 렌더링
  renderQuestion(currentQuestionIndex);
});
