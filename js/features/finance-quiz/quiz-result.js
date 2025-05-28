import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const quizResults = JSON.parse(localStorage.getItem("quizResults")) || [];
  const chartScore = document.getElementById("chart-score");
  const feedbackBubble = document.querySelector(".speech-bubble");
  const finishButton = document.getElementById("finish-button");

  try {
    const response = await authorizedFetch("http://43.202.211.168:8080/api/quiz/complete", {
      method: "POST",
      body: JSON.stringify(quizResults)
    });

    if (!response.ok) {
      throw new Error("결과 제출 실패");
    }

    const result = await response.json();
    const { totalQuestions, correctCount, rewardExp, rewardCoin, passed } = result.data;

    // 점수 표시
    chartScore.textContent = `${correctCount}/${totalQuestions}`;

    // 피드백 메시지
    feedbackBubble.textContent = passed ? "잘했어요! 대단해요!" : "더 공부가 필요해요.\n퀴즈를 다시 풀어볼까요?!";

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
          legend: { display: false }
        }
      }
    });

    // ✅ 선택사항: 보상 정보 저장 또는 출력
    console.log("🏆 획득 경험치:", rewardExp, " / 가상코인:", rewardCoin);
    localStorage.setItem("lastQuizRewardExp", rewardExp);
    localStorage.setItem("lastQuizRewardCoin", rewardCoin);

  } catch (error) {
    console.error("퀴즈 결과 처리 실패:", error);
    feedbackBubble.textContent = "결과를 불러오는 데 실패했어요.";
  }

  // ✅ 종료 버튼 → 홈으로 이동
  finishButton.addEventListener("click", () => {
    window.location.href = "/quiz-category.html";
  });
});
