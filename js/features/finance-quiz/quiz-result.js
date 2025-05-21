document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("authToken");
  const quizResults = JSON.parse(localStorage.getItem("quizResults")) || [];

  const chartScore = document.getElementById("chart-score");
  const feedbackBubble = document.querySelector(".speech-bubble");
  const finishButton = document.getElementById("finish-button");

  // 결과 제출
  try {
    const response = await fetch("http://43.202.211.168:8080/api/quiz/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(quizResults)
    });

    if (!response.ok) {
      throw new Error("결과 제출 실패");
    }

    const result = await response.json();
    const data = result.data;

    const { totalQuestions, correctCount, passed } = data;

    // 점수 표시
    chartScore.textContent = `${correctCount}/${totalQuestions}`;

    // 피드백 메시지
    feedbackBubble.textContent = passed ? "잘했어요! 대단해요!" : "더 공부가 필요해요!";

    // 차트 그리기
    const ctx = document.getElementById("quizChart").getContext("2d");
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["정답", "오답"],
        datasets: [{
          data: [correctCount, totalQuestions - correctCount],
          backgroundColor: ["#5DC29E", "#E0E0E0"],
          borderWidth: 2
        }]
      },
      options: {
        cutout: "70%",
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

  } catch (error) {
    console.error("퀴즈 결과 처리 실패:", error);
    feedbackBubble.textContent = "결과를 불러오는 데 실패했어요.";
  }

  // 종료 버튼 클릭 시 홈으로 이동
  finishButton.addEventListener("click", () => {
    window.location.href = "/pages/index.html";
  });
});
