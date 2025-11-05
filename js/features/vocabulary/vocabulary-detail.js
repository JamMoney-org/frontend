import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryName = urlParams.get("categoryName");
  const dayIndex = urlParams.get("day");

  const wordTitle = document.querySelector(".word-title");
  const wordDesc = document.querySelector(".word-desc");
  const exampleText = document.querySelector(".example-text");
  const bookmarkButton = document.querySelector(".bookmark");

  const prevButton = document.getElementById("card-prev-button");
  const nextButton = document.getElementById("card-next-button");
  const progressBar = document.getElementById("progress-bar");

  const quizModal = document.getElementById("quiz-modal");
  const quizConfirm = document.getElementById("quiz-confirm");
  const quizCancel = document.getElementById("quiz-cancel");

  let currentIndex = 0;
  let words = [];

  try {
    const response = await authorizedFetch(
      `https://jm-money.com/api/terms/categories/${encodeURIComponent(
        categoryName
      )}/days/${dayIndex}/terms`,
      { method: "GET" }
    );

    words = await response.json();

    if (!Array.isArray(words) || words.length === 0) return;

    renderCard(currentIndex);
  } catch (err) {}

  function renderCard(index) {
    const word = words[index];

    wordTitle.textContent = word.term;
    wordDesc.textContent = word.definition;
    exampleText.textContent = word.exampleSentences?.[0] || "예문이 없습니다.";

    progressBar.style.width = `${((index + 1) / words.length) * 100}%`;

    bookmarkButton.style.backgroundImage = word.bookmarked
      ? "url('../assets/icon/bookmark-fill.svg')"
      : "url('../assets/icon/bookmark.svg')";
  }

  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderCard(currentIndex);
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentIndex < words.length - 1) {
      currentIndex++;
      renderCard(currentIndex);
    } else {
      quizModal.style.display = "flex";
    }
  });

  quizConfirm.addEventListener("click", () => {
    window.location.href = `/pages/vocabulary/vocabulary_quiz.html?categoryName=${encodeURIComponent(
      categoryName
    )}&day=${dayIndex}`;
  });

  quizCancel.addEventListener("click", () => {
    window.location.href = "/pages/vocabulary/vocabulary_category.html";
  });

  bookmarkButton.addEventListener("click", async () => {
    const word = words[currentIndex];
    const termId = word.termId;

    try {
      const res = await authorizedFetch(
        `https://jm-money.com/api/terms/bookmark/${termId}`,
        {
          method: word.bookmarked ? "DELETE" : "POST",
        }
      );

      if (!res.ok) return;

      word.bookmarked = !word.bookmarked;
      renderCard(currentIndex);
    } catch (err) {}
  });
});
