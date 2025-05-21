document.addEventListener("DOMContentLoaded", () => {
  const quizItems = document.querySelectorAll(".quiz-item");
  const category = localStorage.getItem("selectedCategory"); // ✅ enum 값 그대로 불러옴
  const token = localStorage.getItem("authToken");

  const difficultyMap = {
    "초급": "EASY",
    "중급": "NORMAL",
    "고급": "HARD"
  };

  quizItems.forEach(item => {
    item.addEventListener("click", async () => {
      const korDifficulty = item.querySelector(".day-label").textContent.trim();
      const enumDifficulty = difficultyMap[korDifficulty];

      // 디버깅용 로그
      console.log("보내는 카테고리:", category);
      console.log("보내는 난이도:", enumDifficulty);
      console.log("토큰:", token);

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
        localStorage.setItem("selectedDifficulty", korDifficulty); // 한글로 저장 (UI용)

        window.location.href = "/pages/quiz_detail.html";
      } catch (error) {
        console.error("퀴즈 요청 실패:", error);
        alert("퀴즈를 불러오는 데 실패했습니다.");
      }
    });
  });
});
