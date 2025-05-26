import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const newsId = params.get("id");

  if (!newsId) {
    alert("잘못된 접근입니다.");
    return;
  }

  try {
    const response = await authorizedFetch(`http://43.202.211.168:8080/api/news/${newsId}`);
    if (!response.ok) {
      throw new Error("뉴스 데이터를 불러오지 못했습니다.");
    }

    const news = await response.json();

    // 제목, 출처, 날짜
    document.querySelector(".article-title").textContent = news.title;
    document.getElementById("source").textContent = `출처: ${news.source} · ${formatDate(news.publishDate)}`;
    document.querySelector(".article-content").textContent = news.content;

    // AI 요약 처리
    const summaryList = document.querySelector(".ai-summary ul");
    summaryList.innerHTML = "";

    if (news.summary && news.summary.trim() !== "") {
      const points = news.summary
        .split(/(?<=\.)\s+/)
        .filter(p => p.trim() !== "");

      if (points.length > 0) {
        points.forEach(point => {
          const li = document.createElement("li");
          li.textContent = point;
          summaryList.appendChild(li);
        });
      } else {
        summaryList.innerHTML = "<li>요약이 없습니다.</li>";
      }
    } else {
      summaryList.innerHTML = "<li>요약이 없습니다.</li>";
    }

    // 퀴즈 렌더링
    const quizContainer = document.querySelector(".quiz-container");
    const questionElem = document.getElementById("question");
    const existingButtons = quizContainer.querySelectorAll("button");
    existingButtons.forEach(btn => btn.remove());

    if (news.quiz && news.quiz.question) {
      questionElem.textContent = `Q. ${news.quiz.question}`;

      const options = [
        news.quiz.option1,
        news.quiz.option2,
        news.quiz.option3,
        news.quiz.option4
      ].filter(opt => opt);

      const circledNumbers = ["\u2460", "\u2461", "\u2462", "\u2463"];

      // 모달 요소 참조
      const quizModal = document.getElementById("quiz-modal");
      const quizModalMessage = document.getElementById("quiz-modal-message");
      const quizModalClose = document.getElementById("quiz-modal-close");

      // 닫기 버튼
      quizModalClose.addEventListener("click", () => {
        quizModal.style.display = "none";
      });

      options.forEach((optionText, index) => {
        const btn = document.createElement("button");
        btn.textContent = `${circledNumbers[index] || ""} ${optionText}`;
        btn.classList.add("quiz-option");

        btn.addEventListener("click", () => {
          const isCorrect = index === news.quiz.correctAnswerIndex;

          // 모든 버튼 비활성화 + 색상 표시
          const allButtons = quizContainer.querySelectorAll("button");
          allButtons.forEach((b, i) => {
            b.disabled = true;
            if (i === news.quiz.correctAnswerIndex) {
              b.classList.add("correct");
            } else if (b === btn) {
              b.classList.add("wrong");
            }
          });

          quizModalMessage.textContent = isCorrect ? "✅ 정답입니다!" : "❌ 오답입니다.";
          quizModal.style.display = "flex";
        });

        quizContainer.appendChild(btn);
      });
    } else {
      questionElem.textContent = "관련 퀴즈가 없습니다.";
    }

  } catch (err) {
    console.error("에러 발생:", err);
    alert("뉴스를 불러오는 중 문제가 발생했습니다.");
  }
});

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getDate().toString().padStart(2, "0")}`;
}
