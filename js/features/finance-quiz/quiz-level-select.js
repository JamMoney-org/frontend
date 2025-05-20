document.addEventListener("DOMContentLoaded", () => {
  const quizItems = document.querySelectorAll(".quiz-item");
  const category = document.getElementById("category-title").textContent.trim();
  const token = localStorage.getItem("authToken");

  quizItems.forEach(item => {
    item.addEventListener("click", async () => {
      const difficulty = item.querySelector(".day-label").textContent.trim();

      try {
        const response = await fetch("http://43.202.211.168:8080/api/quiz/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            category: category,
            difficulty: difficulty
          })
        });

        if (!response.ok) {
          throw new Error("퀴즈 생성 실패");
        }

        const result = await response.json();

        // 로컬스토리지에 퀴즈 저장
        localStorage.setItem("currentQuizSet", JSON.stringify(result.data));
        localStorage.setItem("selectedCategory", category);
        localStorage.setItem("selectedDifficulty", difficulty);

        // 퀴즈 상세 페이지로 이동
        window.location.href = "/pages/quiz_detail.html";
      } catch (error) {
        console.error("퀴즈 요청 실패:", error);
        alert("퀴즈를 불러오는 데 실패했습니다.");
      }
    });
  });
});
