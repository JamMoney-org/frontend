import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const quizResults = JSON.parse(localStorage.getItem("quizResults")) || [];
  const chartScore = document.getElementById("chart-score");
  const feedbackBubble = document.querySelector(".speech-bubble");
  const finishButton = document.getElementById("finish-button");
  const retryButton = document.getElementById("retry-button");

  try {
    const response = await authorizedFetch(
      "https://jm-money.com/api/quiz/complete",
      {
        method: "POST",
        body: JSON.stringify(quizResults),
      }
    );

    if (!response.ok) {
      throw new Error("결과 제출 실패");
    }

    const result = await response.json();
    const { totalQuestions, correctCount, rewardExp, rewardCoin, passed } =
      result.data;

    chartScore.textContent = `${correctCount}/${totalQuestions}`;

    if (passed) {
      feedbackBubble.innerHTML =
        `<span style="font-weight: bold; font-size: 1.1em;">잘했어요! 대단해요!</span><br><br>` +
        `<b style="font-size: 1.1em;">+🏆 ${rewardExp} 경험치</b><br>` +
        `<b style="font-size: 1.1em;">+💰 ${rewardCoin} 잼머니</b>`;
    } else {
      feedbackBubble.innerHTML =
        "더 공부가 필요해요.<br>퀴즈를 다시 풀어볼까요?!";

      retryButton.classList.remove("hidden");

      const selectedCategory = localStorage.getItem("selectedCategoryName");
      const selectedDifficulty = localStorage.getItem("selectedDifficulty");

      retryButton.addEventListener("click", () => {
        if (!selectedCategory || !selectedDifficulty) {
          alert("퀴즈 정보를 찾을 수 없습니다.");
          return;
        }

        window.location.href = `/pages/finance-quiz/quiz_detail.html?categoryName=${encodeURIComponent(
          selectedCategory
        )}&difficulty=${encodeURIComponent(selectedDifficulty)}`;
      });
    }

    const ctx = document.getElementById("quizChart").getContext("2d");
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["정답", "오답"],
        datasets: [
          {
            data: [correctCount, totalQuestions - correctCount],
            backgroundColor: ["#5DC29E", "#E0E0E0"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        cutout: "70%",
        plugins: {
          legend: { display: false },
        },
      },
    });

    console.log("🏆 획득 경험치:", rewardExp, " / 가상코인:", rewardCoin);
    localStorage.setItem("lastQuizRewardExp", rewardExp);
    localStorage.setItem("lastQuizRewardCoin", rewardCoin);
  } catch (error) {
    console.error("퀴즈 결과 처리 실패:", error);
    feedbackBubble.textContent = "결과를 불러오는 데 실패했어요.";
  }

  finishButton.addEventListener("click", () => {
    window.location.href = "/pages/finance-quiz/quiz_category.html";
  });
});
