import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", () => {
  const quizItems = document.querySelectorAll(".quiz-item");
  const category = localStorage.getItem("selectedCategoryEnum");
  const difficultyMap = {
    초급: "EASY",
    중급: "NORMAL",
    고급: "HARD",
  };

  const loadingTip = document.getElementById("quiz-loading-tip");
  const loadingOverlay = document.getElementById("quiz-loading-overlay");
  const categoryName = localStorage.getItem("selectedCategoryName");
  const categoryTitle = document.getElementById("category-title");

  if (categoryTitle && categoryName) {
    categoryTitle.textContent = categoryName;
  }

  quizItems.forEach((item) => {
    item.addEventListener("click", async () => {
      const korDifficulty = item
        .querySelector(".difficulty-label")
        .textContent.trim();
      const enumDifficulty = difficultyMap[korDifficulty];

      if (!category || !enumDifficulty) {
        alert("카테고리 또는 난이도가 올바르지 않습니다.");
        return;
      }

      const payload = {
        category: category,
        difficulty: enumDifficulty,
      };

      // 로딩 시작
      loadingTip.classList.remove("hidden");
      loadingOverlay.classList.remove("hidden");

      try {
        const response = await authorizedFetch(
          "https://jm-money.com/api/quiz/generate",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error("퀴즈 생성 실패");
        }

        const result = await response.json();

        localStorage.setItem("currentQuizSet", JSON.stringify(result.data));
        localStorage.setItem("selectedDifficulty", korDifficulty);

        window.location.href = "/pages/finance-quiz/quiz_detail.html";
      } catch (error) {
        alert("퀴즈를 불러오는 데 실패했습니다.");
      } finally {
        loadingTip.classList.add("hidden");
        loadingOverlay.classList.add("hidden");
      }
    });
  });
});
