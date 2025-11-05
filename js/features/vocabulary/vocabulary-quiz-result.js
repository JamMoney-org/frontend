import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", () => {
  const result = JSON.parse(localStorage.getItem("quizResultSummary"));

  if (
    !result ||
    typeof result.correctCount !== "number" ||
    typeof result.totalQuestions !== "number"
  ) {
    alert("결과 데이터를 불러오는 데 실패했습니다.");
    window.location.href = "/pages/mainpage/mainpage.html";
    return;
  }

  const correctCount = result.correctCount;
  const totalCount = result.totalQuestions;

  const feedback = document.getElementById("feedback");
  const chartScore = document.getElementById("chart-score");

  if (feedback) {
    if (correctCount >= 3) {
      feedback.textContent = "잘했어요! 대단해요!";
    } else {
      feedback.textContent = "더 공부가 필요해요!";
    }
  }

  if (chartScore) {
    chartScore.textContent = `${correctCount}/${totalCount}`;
  }

  const ctx = document.getElementById("quizChart").getContext("2d");
  if (ctx) {
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["정답", "오답"],
        datasets: [
          {
            data: [correctCount, totalCount - correctCount],
            backgroundColor: ["#5DC29E", "#E0E0E0"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "70%",
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  const finishButton = document.getElementById("finish-button");
  if (finishButton) {
    finishButton.addEventListener("click", () => {
      window.location.href = "/pages/vocabulary/vocabulary_category.html";
    });
  }
});
