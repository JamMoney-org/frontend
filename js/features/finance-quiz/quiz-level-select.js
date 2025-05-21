import { authorizedFetch } from "../../utils/auth-fetch.js"; // 유틸 함수 import

document.addEventListener("DOMContentLoaded", () => {
  const quizItems = document.querySelectorAll(".quiz-item");
  const category = localStorage.getItem("selectedCategory"); 

  const difficultyMap = {
    "초급": "EASY",
    "중급": "NORMAL",
    "고급": "HARD"
  };

  quizItems.forEach(item => {
    item.addEventListener("click", async () => {
      const korDifficulty = item.querySelector(".difficulty-label").textContent.trim();
      const enumDifficulty = difficultyMap[korDifficulty];

      if (!category || !enumDifficulty) {
        alert("카테고리 또는 난이도가 올바르지 않습니다.");
        return;
      }

      const payload = {
        category: category,
        difficulty: enumDifficulty
      };

      try {
        const response = await authorizedFetch("http://43.202.211.168:8080/api/quiz/generate", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("퀴즈 생성 실패");
        }

        const result = await response.json();

        localStorage.setItem("currentQuizSet", JSON.stringify(result.data));
        localStorage.setItem("selectedDifficulty", korDifficulty); // 한글 난이도 저장

        window.location.href = "/pages/quiz_detail.html";
      } catch (error) {
        alert("퀴즈를 불러오는 데 실패했습니다.");
      }
    });
  });
});
