import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get("categoryId");
  const categoryName = params.get("categoryName");

  const categoryTitle = document.getElementById("category-title");
  const wordListContainer = document.getElementById("word-list");

  categoryTitle.textContent = categoryName || "단어장";

  try {
    const response = await authorizedFetch(
      `https://jm-money.com/api/terms/categories/${encodeURIComponent(
        categoryName
      )}/days`,
      { method: "GET" }
    );

    const dayIndexes = await response.json();

    wordListContainer.innerHTML = "";

    dayIndexes.forEach((day) => {
      const wordItem = document.createElement("div");
      wordItem.classList.add("word-item");
      wordItem.dataset.day = day;

      wordItem.innerHTML = `
        <div class="word-info">
          <p class="day-label">DAY${day}</p>
        </div>
      `;

      wordItem.addEventListener("click", () => {
        console.log(`카테고리 ${categoryName}의 DAY${day} 클릭됨`);

        window.location.href = `/pages/vocabulary/vocabulary_detail.html?categoryName=${encodeURIComponent(
          categoryName
        )}&day=${day}`;
      });

      wordListContainer.appendChild(wordItem);
    });
  } catch (err) {
    console.error("Day index 불러오기 실패:", err);
  }
});
