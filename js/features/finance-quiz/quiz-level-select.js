document.addEventListener("DOMContentLoaded", () => {
  const quizItems = document.querySelectorAll(".quiz-item");
  const category = document.getElementById("category-title").textContent.trim();
  const token = localStorage.getItem("authToken");

  // 한글 난이도를 백엔드 enum 값으로 매핑
  const difficultyMap = {
    "초급": "EASY",
    "중급": "NORMAL",
    "고급": "HARD"
  };

  quizItems.forEach(item => {
    item.addEventListener("click", async () => {
      const korDifficulty = item.querySelector(".day-label").textContent.trim();
      const enumDifficulty = difficultyMap[korDifficulty];

      try {
        const response = await fetch("http://43.202.211.168:8080/api/quiz/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            category: category,
            difficulty: enumDifficulty
          })
        });

        if (!response.ok) {
          throw new Error("퀴즈 생성 실패");
        }

        const result = await response.json();

        localStorage.setItem("currentQuizSet", JSON.stringify(result.data));
        localStorage.setItem("selectedCategory", category);
        localStorage.setItem("selectedDifficulty", korDifficulty); // 사용자에게 보여줄 값은 한글로 저장

        window.location.href = "/pages/quiz_detail.html";
      } catch (error) {
        console.error("퀴즈 요청 실패:", error);
        alert("퀴즈를 불러오는 데 실패했습니다.");
      }
    });
  });
});
