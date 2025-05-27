// 전체 뉴스 디테일 JS: 뉴스 + 쉬운말 토스트 + 퀴즈 렌더링 + 북마크 버튼
import { authorizedFetch } from "../../utils/auth-fetch.js";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getDate().toString().padStart(2, "0")}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const newsId = params.get("id");
  if (!newsId) {
    alert("잘못된 접근입니다.");
    return;
  }

  try {
    const response = await authorizedFetch(`http://43.202.211.168:8080/api/news/${newsId}`);
    if (!response.ok) throw new Error("뉴스 데이터를 불러오지 못했습니다.");
    const news = await response.json();

    document.querySelector(".article-title").textContent = news.title;
    document.getElementById("source").textContent = `출처: ${news.source} · ${formatDate(news.publishDate)}`;
    const contentElem = document.querySelector(".article-content");
    contentElem.innerHTML = news.content;

    try {
      const easyWordRes = await authorizedFetch(`http://43.202.211.168:8080/api/news/${newsId}/easy-words`);
      if (!easyWordRes.ok) throw new Error("쉬운말 API 실패");
      const easyWords = await easyWordRes.json();
      highlightEasyWords(contentElem, easyWords, newsId);
    } catch (e) {
      console.warn("쉬운말 단어 불러오기 실패:", e);
    }

    const summaryList = document.querySelector(".ai-summary ul");
    summaryList.innerHTML = "";
    if (news.summary && news.summary.trim() !== "") {
      const points = news.summary.split(/(?<=\.)\s+/).filter(p => p.trim() !== "");
      points.forEach(point => {
        const li = document.createElement("li");
        li.textContent = point;
        summaryList.appendChild(li);
      });
    } else {
      summaryList.innerHTML = "<li>요약이 없습니다.</li>";
    }

    const quizContainer = document.querySelector(".quiz-container");
    const questionElem = document.getElementById("question");
    quizContainer.querySelectorAll("button").forEach(btn => btn.remove());

    if (news.quiz && news.quiz.question) {
      questionElem.textContent = `Q. ${news.quiz.question}`;
      const options = [news.quiz.option1, news.quiz.option2, news.quiz.option3, news.quiz.option4].filter(opt => opt);
      const circledNumbers = ["\u2460", "\u2461", "\u2462", "\u2463"];

      const quizModal = document.getElementById("quiz-modal");
      const quizModalMessage = document.getElementById("quiz-modal-message");
      const quizModalClose = document.getElementById("quiz-modal-close");
      quizModalClose.addEventListener("click", () => quizModal.style.display = "none");

      options.forEach((optionText, index) => {
        const btn = document.createElement("button");
        btn.textContent = `${circledNumbers[index] || ""} ${optionText}`;
        btn.classList.add("quiz-option");
        btn.addEventListener("click", () => {
          const isCorrect = index === news.quiz.correctAnswerIndex;
          quizContainer.querySelectorAll("button").forEach((b, i) => {
            b.disabled = true;
            if (i === news.quiz.correctAnswerIndex) b.classList.add("correct");
            else if (b === btn) b.classList.add("wrong");
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

function highlightEasyWords(contentElem, wordList, newsId) {
  let html = contentElem.innerHTML;
  wordList.forEach(({ originalWord, translatedText, exampleSentence }) => {
    const safeTooltip = translatedText.replace(/"/g, '&quot;');
    const safeExample = exampleSentence.replace(/"/g, '&quot;');
    const regex = new RegExp(`(${originalWord})(?![^<]*>)`, 'g');
    const span = `<span class="highlighted-term" 
                    data-word="${originalWord}"
                    data-meaning="${safeTooltip}"
                    data-example="${safeExample}" 
                    data-saved="false">$1</span>`;
    html = html.replace(regex, span);
  });
  contentElem.innerHTML = html;

  const terms = contentElem.querySelectorAll(".highlighted-term");
  terms.forEach(term => {
    term.addEventListener("click", async () => {
      const word = term.dataset.word;
      const meaning = term.dataset.meaning;
      const example = term.dataset.example;
      const saved = term.dataset.saved === "true";

      const toast = document.getElementById("easy-toast");
      toast.innerHTML = `
        <strong style="display:block; font-size:15px; color: #222;">${word}</strong>
        <div style="margin-top:4px; color: #000;"><span style="color: #ffcc00;">💡</span> ${meaning}</div>
        <div style="margin-top:4px; color: #000;">예) ${example}</div>
        <div style="margin-top:20px; text-align:center">
          <button id="bookmark-btn" class="easy-bookmark-btn">
            나만의 단어장에 추가
          </button>
        </div>
      `;
      toast.classList.add("visible");

      const bookmarkBtn = document.getElementById("bookmark-btn");
      bookmarkBtn.onclick = async (e) => {
        e.stopPropagation();
        try {
          const res = await authorizedFetch(`http://43.202.211.168:8080/api/news/${newsId}/easy-words`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ originalWord: word, translatedText: meaning, exampleSentence })
          });
          if (!res.ok) throw new Error();
          bookmarkBtn.textContent = "✅ 추가됨";
          bookmarkBtn.disabled = true;
          bookmarkBtn.classList.add("added");
          term.dataset.saved = "true";
        } catch (err) {
          alert("단어 저장 실패");
        }
      };

      clearTimeout(window.toastTimeout);
      window.toastTimeout = setTimeout(() => {
        toast.classList.remove("visible");
      }, 3000);
    });
  });
}

export { highlightEasyWords };
