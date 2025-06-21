import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const wordListContainer = document.getElementById("word-list");

  try {
    const response = await authorizedFetch("https://jm-money.com/api/terms/my-terms", {
      method: "GET"
    });

    if (!response.ok) {
      throw new Error("저장된 단어를 불러오지 못했습니다.");
    }

    const savedTerms = await response.json();

    if (!Array.isArray(savedTerms) || savedTerms.length === 0) {
      wordListContainer.innerHTML = `<p class="empty-message">저장된 단어가 없습니다.</p>`;
      return;
    }

    wordListContainer.innerHTML = ""; // 기존 내용 제거

    savedTerms.forEach(term => {
      const wordItem = document.createElement("div");
      wordItem.classList.add("myword-item"); // ✅ 변경된 클래스명 사용

      const exampleListHTML = term.exampleSentences && term.exampleSentences.length > 0
        ? `<ul class="term-example-list">${term.exampleSentences.map(e => `<li>${e}</li>`).join('')}</ul>`
        : `<p class="term-example-empty">예문 없음</p>`;

      wordItem.innerHTML = `
        <div class="word-info">
          <p class="term-word"><strong>${term.term}</strong></p>
          <p class="term-meaning">${term.definition}</p>
          ${exampleListHTML}
        </div>
      `;

      wordListContainer.appendChild(wordItem);
    });

  } catch (err) {
    console.error("나만의 단어장 로딩 실패:", err);
    wordListContainer.innerHTML = `<p class="error-message">단어를 불러오는 중 오류가 발생했습니다.</p>`;
  }
});
